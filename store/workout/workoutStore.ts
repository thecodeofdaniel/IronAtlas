import { produce } from 'immer';
import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { db } from '@/db/instance';
// import * as sch from '@/db/schema/template';
// import * as schema from '@/db/schema/workout';
import * as sch from '@/db/schema';
import {
  TSelectWorkoutTemplate,
  TSelectVolumeTemplate,
  TSelectSettTemplate,
} from '@/db/schema/template';
import { generateSettId, saveExerciseToTemplate } from './utils';
import { eq } from 'drizzle-orm';

export type WorkoutStateVal = {
  template: TemplateMap;
  inWorkout: boolean;
  startTime: Date | null;
  pickedExercises: number[];
  pickedExercisesSet: Set<number>;
};

export type WorkoutStateFunctions = {
  toggleWorkout: () => void;
  clearPickedExercises: () => void;
  clearTemplate: () => void;
  pickExercise: (id: number) => void;
  addExercises: (exerciseIds: number[], uuid?: string) => void;
  addSuperset: (exerciseIds: number[]) => void;
  reorderTemplate: (templateObjs: TemplateObj[]) => void;
  deleteExercise: (uuid: string) => void;
  addSet: (uuid: string) => void;
  editSet: (uuid: string, index: number, newSet: SettType) => void;
  reorderSets: (uuid: string, sets: SettType[]) => void;
  saveAsTemplate: (name: string) => Promise<void>;
  upsertTemplate: (name: string, id?: number) => Promise<void>;
  upsertWorkout: (id?: number) => Promise<void>;
  validateWorkout: (workoutId?: number) => Promise<boolean>;
  loadTemplate: (id: number) => Promise<void>;
  loadWorkout: (id: number) => Promise<void>;
};

type WorkoutStore = WorkoutStateVal & WorkoutStateFunctions;

const TEMPLATE_ROOT = {
  '0': {
    exerciseId: 0,
    uuid: '0',
    sets: [],
    children: [],
    parentId: null, // No parent for the root
  },
};

export function createWorkoutStore() {
  return create<WorkoutStore>((set, get) => ({
    template: TEMPLATE_ROOT,
    inWorkout: false,
    startTime: null,
    pickedExercises: [],
    pickedExercisesSet: new Set(),
    toggleWorkout: () =>
      set(
        produce<WorkoutStore>((state) => {
          if (state.inWorkout) {
            state.startTime = null; // stop
            state.inWorkout = false;
          } else {
            // state.startTime = Date.now(); // start
            state.startTime = new Date();
            state.inWorkout = true;
            // console.log(state.startTime);
          }
        }),
      ),
    clearPickedExercises: () =>
      set({ pickedExercises: [], pickedExercisesSet: new Set() }),
    clearTemplate: () => set({ template: TEMPLATE_ROOT }),
    pickExercise: (id) =>
      set(
        produce<WorkoutStore>((state) => {
          // If exercise exists in set then remove from array
          if (state.pickedExercisesSet.has(id)) {
            const newPickedOrder = state.pickedExercises.filter(
              (_id) => _id !== id,
            );

            state.pickedExercises = newPickedOrder;
            state.pickedExercisesSet.delete(id);
          }
          // Otherwise append id onto array
          else {
            state.pickedExercises.push(id);
            state.pickedExercisesSet.add(id);
          }
        }),
      ),

    addExercises: (exerciseIds, uuid = '0') =>
      set(
        produce<WorkoutStore>((state) => {
          const newUUIDs: string[] = [];

          // Create object with generated UUID
          exerciseIds.map((exerciseId) => {
            const newUUID = Crypto.randomUUID();
            newUUIDs.push(newUUID);

            return (state.template[newUUID] = {
              exerciseId: exerciseId,
              uuid: newUUID,
              sets: [{ key: Date.now(), type: 'N', weight: '', reps: '' }],
              children: [],
              parentId: uuid,
            });
          });

          // Add exerciseIds to parent
          state.template[uuid].children = [
            ...state.template[uuid].children,
            ...newUUIDs,
          ];
        }),
      ),
    addSuperset: (exerciseIds) =>
      set(
        produce<WorkoutStore>((state) => {
          // Create parent UUID
          const parentUUID = Crypto.randomUUID();

          // Create exercises for superset
          const newUUIDs: string[] = [];

          exerciseIds.map((exerciseId) => {
            const newUUID = Crypto.randomUUID();
            newUUIDs.push(newUUID);

            return (state.template[newUUID] = {
              exerciseId: exerciseId,
              uuid: newUUID,
              sets: [{ key: Date.now(), type: 'N', weight: '', reps: '' }],
              children: [],
              parentId: parentUUID,
            });
          });

          // Create superset object with uuids of children
          state.template[parentUUID] = {
            exerciseId: null,
            uuid: parentUUID,
            sets: [],
            children: newUUIDs,
            parentId: '0',
          };

          // Add superset to root
          state.template[0].children = [
            ...state.template[0].children,
            parentUUID,
          ];
        }),
      ),
    reorderTemplate: (templateObjs) =>
      set(
        produce<WorkoutStore>((state) => {
          const parentId = templateObjs[0].parentId; // Get the parentId from the first item
          const updatedChildren = templateObjs.map((obj) => obj.uuid);

          // Parent id will never be null
          state.template[parentId!].children = updatedChildren;
        }),
      ),
    deleteExercise: (uuid) =>
      set(
        produce<WorkoutStore>((state) => {
          const parentUUID = state.template[uuid].parentId;
          if (!parentUUID) return;

          // Get the new order of exercises
          const newExerciseOrder = state.template[parentUUID].children.filter(
            (_uuid) => _uuid !== uuid,
          );

          state.template[parentUUID] = {
            ...state.template[parentUUID],
            children: newExerciseOrder,
          };

          // Check if superset
          if (state.template[uuid].children.length > 0) {
            // Delete the children
            state.template[uuid].children.map(
              (childUUID) => delete state.template[childUUID],
            );
          }

          delete state.template[uuid];
        }),
      ),
    addSet: (uuid) =>
      set(
        produce<WorkoutStore>((state) => {
          const lastElementIdx = state.template[uuid].sets.length - 1;

          if (lastElementIdx === -1) {
            state.template[uuid].sets.push({
              key: Date.now(),
              type: 'N',
              weight: '',
              reps: '',
            });
          } else {
            state.template[uuid].sets.push({
              key: Date.now(),
              type: state.template[uuid].sets[lastElementIdx].type,
              weight: state.template[uuid].sets[lastElementIdx].weight,
              reps: '',
            });
          }
        }),
      ),
    reorderSets: (uuid, sets) =>
      set(
        produce<WorkoutStore>((state) => {
          state.template[uuid].sets = sets;
        }),
      ),
    editSet: (uuid, index, newSet) =>
      set(
        produce<WorkoutStore>((state) => {
          state.template[uuid].sets[index] = newSet;
        }),
      ),
    saveAsTemplate: async (name) => {
      try {
        const template = get().template;
        const rootChildren = template[0].children;

        // Start a transaction to ensure all operations succeed or none do
        await db.transaction(async (tx) => {
          // Create the workout template
          const [workoutTemplate] = await tx
            .insert(sch.workoutTemplate)
            .values({ name })
            .returning({ id: sch.workoutTemplate.id });

          // Process all exercises/supersets
          await Promise.all(
            rootChildren.map(async (uuid, index) => {
              const templateItem = template[uuid];

              // Handle superset
              if (templateItem.exerciseId === null) {
                await Promise.all(
                  templateItem.children.map(async (childUUID, subIndex) => {
                    await saveExerciseToTemplate(tx, {
                      template,
                      exerciseUUID: childUUID,
                      workoutTemplateId: workoutTemplate.id,
                      index,
                      subIndex,
                    });
                  }),
                );
              }
              // Handle regular exercise
              else {
                await saveExerciseToTemplate(tx, {
                  template,
                  exerciseUUID: uuid,
                  workoutTemplateId: workoutTemplate.id,
                  index,
                  subIndex: null,
                });
              }
            }),
          );
        });

        set({ template: TEMPLATE_ROOT });
      } catch (error) {
        console.error('Error: When saving template -', error);
        throw error; // Re-throw to handle in UI
      }
    },
    upsertTemplate: async (name, workoutTemplateId) => {
      try {
        const template = get().template;
        const rootChildren = template[0].children;

        await db.transaction(async (tx) => {
          let createdAt: number | undefined;

          if (workoutTemplateId) {
            const [existingWorkout] = await tx
              .delete(sch.workoutTemplate)
              .where(eq(sch.workoutTemplate.id, workoutTemplateId))
              .returning();

            if (existingWorkout) createdAt = existingWorkout.createdAt;
          }

          const [workoutTemplate] = await tx
            .insert(sch.workoutTemplate)
            .values({ name, createdAt })
            .returning();

          // Process exercises and supersets
          await Promise.all(
            rootChildren.map(async (uuid, index) => {
              const templateItem = template[uuid];

              if (templateItem.exerciseId === null) {
                // Handle superset
                await Promise.all(
                  templateItem.children.map((childUUID, subIndex) =>
                    saveExerciseToTemplate(tx, {
                      template,
                      exerciseUUID: childUUID,
                      workoutTemplateId: workoutTemplate.id,
                      index,
                      subIndex,
                    }),
                  ),
                );
              } else {
                // Handle single exercise
                await saveExerciseToTemplate(tx, {
                  template,
                  exerciseUUID: uuid,
                  workoutTemplateId: workoutTemplate.id,
                  index,
                  subIndex: null,
                });
              }
            }),
          );
        });

        set({ template: TEMPLATE_ROOT });
      } catch (error) {
        console.error('Error updating template in db:', error);
        throw error;
      }
    },
    upsertWorkout: async (workoutId) => {
      try {
        const isValid = await get().validateWorkout(workoutId);

        if (!isValid) {
          console.error('Invalid workout, cannot upsert.');
          return;
        }

        const template = get().template;
        // console.log('Current template:', template);
        const startTime = get().startTime!;
        const rootChildren = template[0].children;

        await db.transaction(async (tx) => {
          // If we're inserting
          let date = startTime;
          // let duration = Math.floor(Date.now() - startTime.getTime()) / 1000;

          if (workoutId) {
            // console.log('yooooo');
            const [existingWorkout] = await tx
              .delete(sch.workout)
              .where(eq(sch.workout.id, workoutId))
              .returning({ date: sch.workout.date });

            // If updating, change the date and duration to original values
            if (existingWorkout) {
              date = existingWorkout.date;
              // duration = existingWorkout.duration;
            }
          }

          const [workout] = await tx
            .insert(sch.workout)
            .values({
              date: date,
              duration: 0,
            })
            .returning();

          await Promise.all(
            rootChildren.map(async (uuid, index) => {
              const item = template[uuid];

              if (item.exerciseId === null) {
                // Handle superset
                await Promise.all(
                  item.children.map(async (childUUID, subIndex) => {
                    const exercise = template[childUUID];

                    const [volume] = await tx
                      .insert(sch.volume)
                      .values({
                        exerciseId: exercise.exerciseId!,
                        workoutId: workout.id,
                        index: index,
                        subIndex: subIndex,
                      })
                      .returning({ id: sch.volume.id });

                    await tx.insert(sch.sett).values(
                      exercise.sets.map((sett, idx) => ({
                        volumeId: volume.id,
                        index: idx,
                        type: sett.type,
                        weight: Number(sett.weight),
                        reps: Number(sett.reps),
                      })),
                    );
                  }),
                );
              } else {
                const exercise = item;

                const [volume] = await tx
                  .insert(sch.volume)
                  .values({
                    exerciseId: exercise.exerciseId!,
                    workoutId: workout.id,
                    index: index,
                    subIndex: null,
                  })
                  .returning({ id: sch.volume.id });

                await tx.insert(sch.sett).values(
                  exercise.sets.map((sett, idx) => ({
                    volumeId: volume.id,
                    index: idx,
                    type: sett.type,
                    weight: Number(sett.weight),
                    reps: Number(sett.reps),
                  })),
                );
              }
            }),
          );
        });
      } catch (error) {
        console.error('Error upserting workout into db:', error);
      }
    },
    validateWorkout: async (workoutId) => {
      let hasValidWorkout = false;

      set(
        produce<WorkoutStore>((state) => {
          const rootChildren = [...state.template[0].children];

          // Process each root level item
          state.template[0].children = rootChildren.filter((uuid) => {
            const item = state.template[uuid];

            // Handle superset
            if (item.exerciseId === null) {
              item.children = item.children.filter((childUUID) => {
                const exercise = state.template[childUUID];
                // Keep sets that have either weight or reps
                exercise.sets = exercise.sets.filter(
                  (set) => set.weight !== '' && set.reps !== '',
                );

                // Keep exercise if it has any sets
                if (exercise.sets.length > 0) {
                  hasValidWorkout = true;
                  return true;
                }
                delete state.template[childUUID];
                return false;
              });

              // Keep superset if it has any children
              if (item.children.length > 0) {
                return true;
              }
              delete state.template[uuid];
              return false;
            }
            // Handle single exercise
            else {
              // Keep sets that have either weight or reps
              item.sets = item.sets.filter(
                (set) => set.weight !== '' && set.reps !== '',
              );

              // Keep exercise if it has any sets
              if (item.sets.length > 0) {
                hasValidWorkout = true;
                return true;
              }
              delete state.template[uuid];
              return false;
            }
          });

          // hasValidWorkout = state.template[0].children.length > 0;
        }),
      );

      return hasValidWorkout;
    },
    loadTemplate: async (id) => {
      try {
        set({ template: TEMPLATE_ROOT });

        // Get volumes with their sets in a single query
        const volumes = await db
          .select({
            volume: sch.volumeTemplate,
            sett: sch.settTemplate,
          })
          .from(sch.volumeTemplate)
          .leftJoin(
            sch.settTemplate,
            eq(sch.volumeTemplate.id, sch.settTemplate.volumeTemplateId),
          )
          .where(eq(sch.volumeTemplate.workoutTemplateId, id))
          .orderBy(
            sch.volumeTemplate.index,
            sch.volumeTemplate.subIndex,
            sch.settTemplate.index,
          );

        // Group volumes with their sets more directly
        const volumesByIndex = volumes.reduce(
          (acc, { volume, sett }) => {
            const index = volume.index;
            if (!acc[index]) acc[index] = new Map();

            if (!acc[index].has(volume.id)) {
              acc[index].set(volume.id, {
                ...volume,
                setts: [],
              });
            }

            const volumeEntry = acc[index].get(volume.id);
            if (sett && volumeEntry) {
              volumeEntry.setts.push(sett);
            }

            return acc;
          },
          {} as Record<
            number,
            Map<
              number,
              TSelectVolumeTemplate & { setts: TSelectSettTemplate[] }
            >
          >,
        );

        // Update state with grouped data
        set(
          produce<WorkoutStore>((state) => {
            Object.values(volumesByIndex).forEach((volumeGroup) => {
              const volumes = Array.from(volumeGroup.values());

              if (volumes.length > 1) {
                // Handle superset
                const parentUUID = Crypto.randomUUID();
                const childUUIDs = volumes.map((volume) => {
                  const childUUID = Crypto.randomUUID();
                  state.template[childUUID] = {
                    exerciseId: volume.exerciseId,
                    uuid: childUUID,
                    sets: volume.setts.map((set) => ({
                      key: generateSettId(),
                      type: set.type,
                      weight: set.weight?.toString() ?? '',
                      reps: set.reps?.toString() ?? '',
                    })),
                    children: [],
                    parentId: parentUUID,
                  };
                  return childUUID;
                });

                state.template[parentUUID] = {
                  exerciseId: null,
                  uuid: parentUUID,
                  sets: [],
                  children: childUUIDs,
                  parentId: '0',
                };
                state.template['0'].children.push(parentUUID);
              } else {
                // Handle single exercise
                const volume = volumes[0];
                const uuid = Crypto.randomUUID();

                state.template[uuid] = {
                  exerciseId: volume.exerciseId,
                  uuid,
                  sets: volume.setts.map((set) => ({
                    key: generateSettId(),
                    type: set.type,
                    weight: set.weight?.toString() ?? '',
                    reps: set.reps?.toString() ?? '',
                  })),
                  children: [],
                  parentId: '0',
                };
                state.template['0'].children.push(uuid);
              }
            });
          }),
        );
      } catch (error) {
        console.error('Error: When loading template -', error);
        throw error;
      }
    },
    loadWorkout: async (id) => {
      try {
        set({ template: TEMPLATE_ROOT });

        // Get volumes with their sets in a single query
        const volumes = await db
          .select({
            volume: sch.volume,
            sett: sch.sett,
          })
          .from(sch.volume)
          .innerJoin(sch.sett, eq(sch.volume.id, sch.sett.volumeId))
          .where(eq(sch.volume.workoutId, id))
          .orderBy(sch.volume.index, sch.volume.subIndex, sch.sett.index);

        // Group by index for easier processing
        const volumesByIndex = volumes.reduce(
          (acc, { volume, sett }) => {
            const index = volume.index;
            if (!acc[index]) acc[index] = new Map();

            if (!acc[index].has(volume.id)) {
              acc[index].set(volume.id, { ...volume, setts: [] });
            }

            if (sett) acc[index].get(volume.id)?.setts.push(sett);
            return acc;
          },
          {} as Record<
            number,
            Map<number, sch.TSelectVolume & { setts: sch.TSelectSett[] }>
          >,
        );

        set(
          produce<WorkoutStore>((state) => {
            Object.values(volumesByIndex).forEach((volumeGroup) => {
              const volumes = Array.from(volumeGroup.values());

              if (volumes.length > 1) {
                // Handle superset
                const parentUUID = Crypto.randomUUID();
                const childUUIDs = volumes.map((volume) => {
                  const childUUID = Crypto.randomUUID();
                  state.template[childUUID] = {
                    exerciseId: volume.exerciseId,
                    uuid: childUUID,
                    sets: volume.setts.map((set) => ({
                      key: generateSettId(),
                      type: set.type,
                      weight: set.weight?.toString() ?? '',
                      reps: set.reps?.toString() ?? '',
                    })),
                    children: [],
                    parentId: parentUUID,
                  };
                  return childUUID;
                });

                state.template[parentUUID] = {
                  exerciseId: null,
                  uuid: parentUUID,
                  sets: [],
                  children: childUUIDs,
                  parentId: '0',
                };
                state.template['0'].children.push(parentUUID);
              } else {
                // Handle single exercise
                const volume = volumes[0];
                const uuid = Crypto.randomUUID();

                state.template[uuid] = {
                  exerciseId: volume.exerciseId,
                  uuid,
                  sets: volume.setts.map((set) => ({
                    key: generateSettId(),
                    type: set.type,
                    weight: set.weight?.toString() ?? '',
                    reps: set.reps?.toString() ?? '',
                  })),
                  children: [],
                  parentId: '0',
                };
                state.template['0'].children.push(uuid);
              }
            });
          }),
        );
      } catch (error) {
        console.error('Error loading workout from workoutStore:', error);
      }
    },
  }));
}

export const useWorkoutStore = createWorkoutStore();

export function useWorkoutStoreHook(): WorkoutStateVal & {
  actions: WorkoutStateFunctions;
} {
  const {
    template,
    inWorkout,
    startTime,
    pickedExercises,
    pickedExercisesSet,
    ...actions
  } = useWorkoutStore((state) => state);

  return {
    template,
    inWorkout,
    startTime,
    pickedExercises,
    pickedExercisesSet,
    actions,
  };
}

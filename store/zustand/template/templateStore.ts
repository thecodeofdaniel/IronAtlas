import { create } from 'zustand';
import { produce } from 'immer';
import { db } from '@/db/instance';
import * as sch from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { generateSettId } from './utils';

export type TemplateStateVal = {
  template: TemplateMap;
  inWorkout: boolean;
  startTime: Date | null;
  pickedExercises: number[];
  pickedExercisesSet: Set<number>;
};

export type TemplateStateFunctions = {
  clearTemplate: () => void;
  toggleWorkout: () => void;
  pickExercise: (id: number) => void;
  clearPickedExercises: () => void;
  addExercises: (exerciseIds: number[], uuid?: string) => void;
  addSuperset: (exerciseIds: number[]) => void;
  reorderTemplate: (templateObjs: TemplateObj[]) => void;
  deleteExercise: (uuid: string) => void;
  addSet: (uuid: string) => void;
  editSet: (uuid: string, index: number, newSet: SettType) => void;
  reorderSets: (uuid: string, sets: SettType[]) => void;
  upsertRoutine: (name: string, id?: number) => Promise<void>;
  upsertWorkout: (id?: number) => Promise<void>;
  validateWorkout: (workoutId?: number) => Promise<boolean>;
  loadRoutine: (id: number) => Promise<void>;
  loadWorkout: (id: number) => Promise<void>;
};

type TemplateStore = TemplateStateVal & TemplateStateFunctions;

const TEMPLATE_ROOT = {
  '0': {
    exerciseId: 0,
    uuid: '0',
    sets: [],
    children: [],
    parentId: null, // No parent for the root
  },
};

export function createTemplateStore() {
  return create<TemplateStore>((set, get) => ({
    template: TEMPLATE_ROOT,
    inWorkout: false,
    startTime: null,
    pickedExercises: [],
    pickedExercisesSet: new Set(),
    clearTemplate: () => set({ template: TEMPLATE_ROOT }),
    toggleWorkout: () =>
      set(
        produce<TemplateStore>((state) => {
          if (state.inWorkout) {
            state.startTime = null; // stop
            state.inWorkout = false;
          } else {
            state.startTime = new Date(); // start
            state.inWorkout = true;
          }
        }),
      ),
    pickExercise: (id) =>
      set(
        produce<TemplateStore>((state) => {
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
    clearPickedExercises: () =>
      set({ pickedExercises: [], pickedExercisesSet: new Set() }),
    addExercises: (exerciseIds, uuid = '0') =>
      set(
        produce<TemplateStore>((state) => {
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
        produce<TemplateStore>((state) => {
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
        produce<TemplateStore>((state) => {
          const parentId = templateObjs[0].parentId; // Get the parentId from the first item
          const updatedChildren = templateObjs.map((obj) => obj.uuid);

          // Parent id will never be null
          state.template[parentId!].children = updatedChildren;
        }),
      ),
    deleteExercise: (uuid) =>
      set(
        produce<TemplateStore>((state) => {
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
        produce<TemplateStore>((state) => {
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
    editSet: (uuid, index, newSet) =>
      set(
        produce<TemplateStore>((state) => {
          state.template[uuid].sets[index] = newSet;
        }),
      ),
    reorderSets: (uuid, sets) =>
      set(
        produce<TemplateStore>((state) => {
          state.template[uuid].sets = sets;
        }),
      ),
    upsertRoutine: async (name, routineId) => {
      try {
        const template = get().template;
        const rootChildren = template[0].children;

        await db.transaction(async (tx) => {
          let createdAt: number | undefined;

          // Remove the existing routine if we're updating
          if (routineId) {
            const [existingRoutine] = await tx
              .delete(sch.routine)
              .where(eq(sch.routine.id, routineId))
              .returning();

            // Save the date
            if (existingRoutine) createdAt = existingRoutine.createdAt;
          }

          const [routine] = await tx
            .insert(sch.routine)
            .values({ name, createdAt })
            .returning();

          // Process exercises and supersets
          await Promise.all(
            rootChildren.map(async (uuid, index) => {
              const templateItem = template[uuid];

              // Handle superset
              if (templateItem.exerciseId === null) {
                await Promise.all(
                  templateItem.children.map(async (childUUID, subIndex) => {
                    const exercise = template[childUUID];

                    // Insert the volumes (exercises)
                    const [volumeRoutine] = await tx
                      .insert(sch.volumeRoutine)
                      .values({
                        routineId: routine.id,
                        exerciseId: exercise.exerciseId!,
                        index: index,
                        subIndex: subIndex,
                      })
                      .returning({ id: sch.volumeRoutine.id });

                    // Insert setts based on volume
                    if (exercise.sets.length > 0) {
                      await tx.insert(sch.settRoutine).values(
                        exercise.sets.map((sett, idx) => ({
                          volumeRoutineId: volumeRoutine.id,
                          index: idx,
                          type: sett.type,
                          weight: sett.weight ? Number(sett.weight) : null,
                          reps: sett.reps ? Number(sett.reps) : null,
                        })),
                      );
                    }
                  }),
                );
              }
              // Handle single exercise
              else {
                const exercise = templateItem;

                // Insert the volumes (exercises)
                const [volumeRoutine] = await tx
                  .insert(sch.volumeRoutine)
                  .values({
                    routineId: routine.id,
                    exerciseId: exercise.exerciseId!,
                    index: index,
                    subIndex: null,
                  })
                  .returning({ id: sch.volumeRoutine.id });

                // Insert setts based on volume
                if (exercise.sets.length > 0) {
                  await tx.insert(sch.settRoutine).values(
                    exercise.sets.map((sett, idx) => ({
                      volumeRoutineId: volumeRoutine.id,
                      index: idx,
                      type: sett.type,
                      weight: sett.weight ? Number(sett.weight) : null,
                      reps: sett.reps ? Number(sett.reps) : null,
                    })),
                  );
                }
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
        produce<TemplateStore>((state) => {
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
    loadRoutine: async (id) => {
      try {
        set({ template: TEMPLATE_ROOT });

        // Get volumes with their sets in a single query
        const volumes = await db
          .select({
            volume: sch.volumeRoutine,
            sett: sch.settRoutine,
          })
          .from(sch.volumeRoutine)
          .leftJoin(
            sch.settRoutine,
            eq(sch.volumeRoutine.id, sch.settRoutine.volumeRoutineId),
          )
          .where(eq(sch.volumeRoutine.routineId, id))
          .orderBy(
            sch.volumeRoutine.index,
            sch.volumeRoutine.subIndex,
            sch.settRoutine.index,
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
              sch.TSelectVolumeRoutine & { setts: sch.TSelectSettRoutine[] }
            >
          >,
        );

        // Update state with grouped data
        set(
          produce<TemplateStore>((state) => {
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
          produce<TemplateStore>((state) => {
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

export const useTemplateStore = createTemplateStore();

export function useTemplateStoreHook(): TemplateStateVal & {
  actions: TemplateStateFunctions;
} {
  const {
    template,
    inWorkout,
    startTime,
    pickedExercises,
    pickedExercisesSet,
    ...actions
  } = useTemplateStore((state) => state);

  return {
    template,
    inWorkout,
    startTime,
    pickedExercises,
    pickedExercisesSet,
    actions,
  };
}

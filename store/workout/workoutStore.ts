import { produce } from 'immer';
import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { db } from '@/db/instance';
import * as templateSchema from '@/db/schema/template';
import { saveExerciseToTemplate } from './utils';

export type WorkoutStateVal = {
  template: TemplateMap;
  pickedExercises: number[];
  pickedExercisesSet: Set<number>;
};

export type WorkoutStateFunctions = {
  pickExercise: (id: number) => void;
  clearExercises: () => void;
  addExercises: (exerciseIds: number[], uuid?: string) => void;
  addSuperset: (exerciseIds: number[]) => void;
  reorderTemplate: (templateObjs: TemplateObj[]) => void;
  deleteExercise: (uuid: string) => void;
  addSet: (uuid: string) => void;
  editSet: (uuid: string, index: number, newSet: SettType) => void;
  reorderSets: (uuid: string, sets: SettType[]) => void;
  saveAsTemplate: (name: string) => Promise<void>;
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
    pickedExercises: [],
    pickedExercisesSet: new Set(),
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
    clearExercises: () =>
      set({ pickedExercises: [], pickedExercisesSet: new Set() }),
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
            .insert(templateSchema.workoutTemplate)
            .values({ name })
            .returning({ id: templateSchema.workoutTemplate.id });

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
  }));
}

export const useWorkoutStore = createWorkoutStore();

export function useWorkoutStoreHook() {
  const { template, pickedExercises, pickedExercisesSet, ...actions } =
    useWorkoutStore((state) => state);

  return {
    template,
    pickedExercises,
    pickedExercisesSet,
    actions,
  };
}

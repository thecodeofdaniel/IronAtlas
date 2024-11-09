import { produce } from 'immer';
import { create } from 'zustand';
import * as Crypto from 'expo-crypto';

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
};

type WorkoutStore = WorkoutStateVal & WorkoutStateFunctions;

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  template: {
    '0': {
      exerciseId: 0,
      uuid: '0',
      sets: [],
      children: [],
      parentId: null, // No parent for the root
    },
  },
  pickedExercises: [],
  pickedExercisesSet: new Set(),
  // pushExerciseId: (newPickedExercise) =>
  //   set(
  //     produce<WorkoutStore>((state) => {
  //       state.pickedExercises.push(newPickedExercise);
  //     }),
  //   ),
  // popExerciseId: () =>
  //   set(
  //     produce<WorkoutStore>((state) => {
  //       state.pickedExercises.pop();
  //     }),
  //   ),
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

        // Add exerciseIds to root
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
            sets: [],
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
}));

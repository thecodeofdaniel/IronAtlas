import { produce } from 'immer';
import { create } from 'zustand';
import * as Crypto from 'expo-crypto';

export type WorkoutStateVal = {
  template: TemplateMap;
  pickedExercises: number[];
};

export type WorkoutStateFunctions = {
  pushExerciseId: (newPickedExercise: number) => void;
  popExerciseId: () => void;
  clearExercises: () => void;
  addExercises: (exerciseIds: number[]) => void;
  addSuperset: (exerciseIds: number[]) => void;
  reorderTemplate: (templateObjs: TemplateObj[]) => void;
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
  pushExerciseId: (newPickedExercise) =>
    set(
      produce<WorkoutStore>((state) => {
        state.pickedExercises.push(newPickedExercise);
      }),
    ),
  popExerciseId: () =>
    set(
      produce<WorkoutStore>((state) => {
        state.pickedExercises.pop();
      }),
    ),
  clearExercises: () => set({ pickedExercises: [] }),
  addExercises: (exerciseIds) =>
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
            sets: [],
            children: [],
            parentId: '0',
          });
        });

        // Add exerciseIds to root
        state.template[0].children = [
          ...state.template[0].children,
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
}));

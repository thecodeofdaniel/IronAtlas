import { create } from 'zustand';
import { produce } from 'immer';
import { formatTagOrExercise } from '@/utils/utils';

type ExerciseStateVal = {
  exerciseMap: ExerciseMap;
  exercisesList: number[];
  exerciseSet: Set<string>;
};

export type ExerciseStateFunctions = {
  createExercise: (newExercise: Exercise) => void;
  updateExerciseList: (newExerciseList: number[]) => void;
  deleteExercise: (id: number) => void;
  updateExercise: (id: number, editedExercise: Exercise) => void;
};

const startingExerciseMap: ExerciseMap = {
  1: {
    id: 1,
    label: 'Bench Press',
    value: 'bench_press',
    order: 0,
  },
  2: {
    id: 2,
    label: 'Squats',
    value: 'squats',
    order: 1,
  },
  3: {
    id: 3,
    label: 'Pullup',
    value: 'pullup',
    order: 2,
  },
  4: {
    id: 4,
    label: 'Deadlift',
    value: 'deadlift',
    order: 3,
  },
};

// Order of exercises
const exerciseListInitial = [1, 2, 3, 4];

// Create set
const exercises = Object.values(startingExerciseMap).map(
  (exercise) => exercise.value
);
const startingExerciseSet = new Set(exercises);

type ExerciseStore = ExerciseStateVal & ExerciseStateFunctions;

export const useExerciseStore = create<ExerciseStore>()((set) => ({
  exerciseMap: startingExerciseMap,
  exercisesList: exerciseListInitial,
  exerciseSet: startingExerciseSet,
  createExercise: (newExercise: Exercise) =>
    set((state) => {
      return {
        exerciseMap: {
          ...state.exerciseMap,
          [newExercise.id]: newExercise,
        },
        exercisesList: [newExercise.id, ...state.exercisesList],
        exerciseSet: new Set([...state.exerciseSet, newExercise.value]),
      };
    }),
  updateExerciseList: (newExercisesList: number[]) =>
    set(
      produce<ExerciseStore>((state) => {
        state.exercisesList = newExercisesList;
      })
    ),
  deleteExercise: (id: number) =>
    set(
      produce<ExerciseStore>((state) => {
        // Remove from the list of IDs
        state.exercisesList = state.exercisesList.filter(
          (exerciseId) => exerciseId !== id
        );

        // Remove exercise form set
        const exerciseToBeRemoved = state.exerciseMap[id];
        state.exerciseSet.delete(exerciseToBeRemoved.value);

        // remove from map
        delete state.exerciseMap[id];

        // Update order in map to match new list
        state.exercisesList.forEach((exerciseId, index) => {
          state.exerciseMap[exerciseId].order = index;
        });
      })
    ),
  updateExercise: (id: number, editedExercise: Exercise) =>
    set(
      produce<ExerciseStore>((state) => {
        // Remove value from set
        state.exerciseSet.delete(state.exerciseMap[id].value);

        // Change value inside map
        state.exerciseMap[id] = {
          ...state.exerciseMap[id],
          ...editedExercise,
        };

        // Add new value to set
        state.exerciseSet.add(editedExercise.value);
      })
    ),
  // increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

export function useExerciseStoreWithSetter(): ExerciseStateVal & {
  setter: ExerciseStateFunctions;
} {
  const {
    exerciseMap,
    exercisesList,
    exerciseSet,
    createExercise,
    updateExerciseList,
    deleteExercise,
    updateExercise,
  } = useExerciseStore((state) => state);

  return {
    exerciseMap,
    exercisesList,
    exerciseSet,
    setter: {
      createExercise,
      updateExerciseList,
      deleteExercise,
      updateExercise,
    },
  };
}

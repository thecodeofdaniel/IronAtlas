import { create } from 'zustand';
import { produce } from 'immer';

type ExerciseStateVal = {
  exerciseMap: ExerciseMap;
  exercisesList: number[];
};

export type ExerciseStateFunctions = {
  createExercise: (newExercise: Exercise) => void;
  updateExerciseList: (newExerciseList: number[]) => void;
  deleteExercise: (id: number) => void;
  updateExercise: (id: number, editedExercise: Partial<Exercise>) => void;
};

const exerciseMapInitial: ExerciseMap = {
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

type ExerciseStore = ExerciseStateVal & ExerciseStateFunctions;

export const useExerciseStore = create<ExerciseStore>()((set) => ({
  exerciseMap: exerciseMapInitial,
  exercisesList: exerciseListInitial,
  createExercise: (newExercise: Exercise) =>
    set((state) => {
      return {
        exerciseMap: {
          ...state.exerciseMap,
          [newExercise.id]: newExercise,
        },
        exercisesList: [newExercise.id, ...state.exercisesList],
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
        // state.exercises = state.exercises.filter(
        //   (exercise: Exercise) => exercise.id !== id
        // );
        // Remove from the list of IDs
        state.exercisesList = state.exercisesList.filter(
          (exerciseId) => exerciseId !== id
        );

        delete state.exerciseMap[id]; // remove from map

        // Update order in map to match new list
        state.exercisesList.forEach((exerciseId, index) => {
          state.exerciseMap[exerciseId].order = index;
        });
      })
    ),
  updateExercise: (id: number, editedExercise: Partial<Exercise>) =>
    set(
      produce<ExerciseStore>((state) => {
        state.exerciseMap[id] = {
          ...state.exerciseMap[id],
          ...editedExercise,
        };
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
    createExercise,
    updateExerciseList,
    deleteExercise,
    updateExercise: editExercise,
  } = useExerciseStore((state) => state);

  return {
    exerciseMap,
    exercisesList,
    setter: {
      createExercise,
      updateExerciseList,
      deleteExercise,
      updateExercise: editExercise,
    },
  };
}

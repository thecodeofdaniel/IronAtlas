import { create } from 'zustand';
import { produce } from 'immer';

type ExerciseStateVal = {
  exercises: Exercise[];
};

export type ExerciseStateFunctions = {
  createExercise: (newExercise: Exercise) => void;
  setExercises: (newExercise: Exercise[]) => void;
  deleteExercise: (id: number) => void;
};

const exercisesInitial: Exercise[] = [
  {
    id: 1,
    title: 'Bench Press',
  },
  {
    id: 2,
    title: 'Squats',
  },
  {
    id: 3,
    title: 'Pullup',
  },
  {
    id: 4,
    title: 'Deadlift',
  },
];

export const useExerciseStore = create<
  ExerciseStateVal & ExerciseStateFunctions
>()((set) => ({
  exercises: exercisesInitial,
  createExercise: (newExercise: Exercise) =>
    set((state) => {
      return { exercises: [newExercise, ...state.exercises] };
    }),
  setExercises: (newExercises: Exercise[]) =>
    set(
      produce((state) => {
        state.exercises = newExercises;
      })
    ),
  deleteExercise: (id: number) =>
    set(
      produce((state) => {
        state.exercises = state.exercises.filter(
          (exercise: Exercise) => exercise.id !== id
        );
      })
    ),
  // increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

export function useExerciseStoreWithSetter(): ExerciseStateVal & {
  setter: ExerciseStateFunctions;
} {
  const { exercises, createExercise, setExercises, deleteExercise } =
    useExerciseStore((state) => state);

  return {
    exercises,
    setter: {
      createExercise,
      setExercises,
      deleteExercise,
    },
  };
}

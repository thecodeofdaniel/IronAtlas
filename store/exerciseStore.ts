import { create } from 'zustand';
import { produce } from 'immer';

type ExerciseStateVal = {
  exercises: Exercise[];
};

export type ExerciseStateFunctions = {
  createExercise: (newExercise: Exercise) => void;
  setExercises: (newExercise: Exercise[]) => void;
  deleteExercise: (id: number) => void;
  editExercise: (id: number, editedExercise: Partial<Exercise>) => void;
};

// have a list of ids which indiacte the order of exercises
// have a obj with keys of those ids

const exercisesInitial: Exercise[] = [
  {
    id: 1,
    label: 'Bench Press',
    value: 'bench_press',
  },
  {
    id: 2,
    label: 'Squats',
    value: 'squats',
  },
  {
    id: 3,
    label: 'Pullup',
    value: 'pullup',
  },
  {
    id: 4,
    label: 'Deadlift',
    value: 'deadlift',
  },
];

type ExerciseStore = ExerciseStateVal & ExerciseStateFunctions;

export const useExerciseStore = create<ExerciseStore>()((set) => ({
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
  editExercise: (id: number, editedExercise: Partial<Exercise>) =>
    set(
      produce((state: ExerciseStateVal & ExerciseStateFunctions) => {
        const index = state.exercises.findIndex(
          (exercise) => exercise.id === id
        );

        if (index !== -1) {
          state.exercises[index] = {
            ...state.exercises[index], // existing values
            ...editedExercise, // override with new values
            id: state.exercises[index].id, // keep same index
          };
        }
      })
    ),
  // increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

export function useExerciseStoreWithSetter(): ExerciseStateVal & {
  setter: ExerciseStateFunctions;
} {
  const {
    exercises,
    createExercise,
    setExercises,
    deleteExercise,
    editExercise,
  } = useExerciseStore((state) => state);

  return {
    exercises,
    setter: {
      createExercise,
      setExercises,
      deleteExercise,
      editExercise,
    },
  };
}

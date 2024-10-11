import { create } from 'zustand';
import { produce } from 'immer';

type ExerciseStateVal = {
  exerciseMap: ExerciseMap;
  exercisesList: number[];
};

// export type ExerciseStateFunctions = {
//   createExercise: (newExercise: Exercise) => void;
//   setExercises: (newExerciseList: Exercise[]) => void;
//   // deleteExercise: (id: number) => void;
//   // editExercise: (id: number, editedExercise: Partial<Exercise>) => void;
// };

export type ExerciseStateFunctions = {
  createExercise: (newExercise: Exercise) => void;
  setExercises: (newExerciseList: number[]) => void;
  deleteExercise: (id: number) => void;
  editExercise: (id: number, editedExercise: Partial<Exercise>) => void;
};

// have a list of ids which indiacte the order of exercises
// have a obj with keys of those ids

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
        exercisesList: [newExercise.id, ...state.exercisesList],
      };
    }),
  setExercises: (newExercisesList: number[]) =>
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
        delete state.exerciseMap[id]; // remove from map
        const exerciseIndex = state.exerciseMap[id].order;
        state.exercisesList.splice(exerciseIndex, 1);
      })
    ),
  editExercise: (id: number, editedExercise: Partial<Exercise>) =>
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

// const exercisesInitial: Exercise[] = [
//   {
//     id: 1,
//     label: 'Bench Press',
//     value: 'bench_press',
//     order: 1,
//   },
//   {
//     id: 2,
//     label: 'Squats',
//     value: 'squats',
//     order: 2,
//   },
//   {
//     id: 3,
//     label: 'Pullup',
//     value: 'pullup',
//     order: 3,
//   },
//   {
//     id: 4,
//     label: 'Deadlift',
//     value: 'deadlift',
//     order: 4,
//   },
// ];

// export const useExerciseStore = create<ExerciseStore>()((set) => ({
//   exercises: exercisesInitial,
//   createExercise: (newExercise: Exercise) =>
//     set((state) => {
//       return { exercises: [newExercise, ...state.exercises] };
//     }),
//   setExercises: (newExercises: Exercise[]) =>
//     set(
//       produce((state) => {
//         state.exercises = newExercises;
//       })
//     ),
//   deleteExercise: (id: number) =>
//     set(
//       produce((state) => {
//         state.exercises = state.exercises.filter(
//           (exercise: Exercise) => exercise.id !== id
//         );
//       })
//     ),
//   editExercise: (id: number, editedExercise: Partial<Exercise>) =>
//     set(
//       produce((state: ExerciseStateVal & ExerciseStateFunctions) => {
//         const index = state.exercises.findIndex(
//           (exercise) => exercise.id === id
//         );

//         if (index !== -1) {
//           state.exercises[index] = {
//             ...state.exercises[index], // existing values
//             ...editedExercise, // override with new values
//             id: state.exercises[index].id, // keep same index
//           };
//         }
//       })
//     ),
//   // increase: (by) => set((state) => ({ bears: state.bears + by })),
// }));

export function useExerciseStoreWithSetter(): ExerciseStateVal & {
  setter: ExerciseStateFunctions;
} {
  const {
    exerciseMap,
    exercisesList,
    createExercise,
    setExercises,
    deleteExercise,
    editExercise,
  } = useExerciseStore((state) => state);

  return {
    exerciseMap,
    exercisesList,
    setter: {
      createExercise,
      setExercises,
      deleteExercise,
      editExercise,
    },
  };
}

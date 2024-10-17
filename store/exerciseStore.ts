import { create } from 'zustand';
import { produce } from 'immer';
import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

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
  removeTagFromExercise: (id: number, tagId: number) => void;
  fetchExercisesFromDB: () => Promise<void>;
};

// const startingExerciseMap: ExerciseMap = {
//   1: {
//     id: 1,
//     label: 'Bench Press',
//     value: 'bench_press',
//     order: 0,
//     tags: new Set(),
//   },
//   2: {
//     id: 2,
//     label: 'Squats',
//     value: 'squats',
//     order: 1,
//     tags: new Set(),
//   },
//   3: {
//     id: 3,
//     label: 'Pullup',
//     value: 'pullup',
//     order: 2,
//     tags: new Set(),
//   },
//   4: {
//     id: 4,
//     label: 'Deadlift',
//     value: 'deadlift',
//     order: 3,
//     tags: new Set(),
//   },
// };

// // Order of exercises
// const exerciseListInitial = [1, 2, 3, 4];

// // Create set
// const exercises = Object.values(startingExerciseMap).map(
//   (exercise) => exercise.value
// );
// const startingExerciseSet = new Set(exercises);

type ExerciseStore = ExerciseStateVal & ExerciseStateFunctions;

export const useExerciseStore = create<ExerciseStore>()((set) => ({
  // exerciseMap: startingExerciseMap,
  // exercisesList: exerciseListInitial,
  // exerciseSet: startingExerciseSet,
  exerciseMap: {},
  exercisesList: [],
  exerciseSet: new Set(),
  fetchExercisesFromDB: async () => {
    try {
      const exercisesData = await db.select().from(schema.exercise).all();
      const exerciseTagsData = await db
        .select()
        .from(schema.exerciseTags)
        .all();

      const exerciseMap: ExerciseMap = {};
      const exerciseSet: Set<string> = new Set();

      // Create an array to hold exercises with their order
      const exercisesWithOrder: { id: number; order: number }[] = [];

      for (const exerciseData of exercisesData) {
        const exerciseId = exerciseData.id;
        const tags = new Set(
          exerciseTagsData
            .filter((et) => et.exerciseId === exerciseId)
            .map((et) => et.tagId)
        );

        // Update the map with exercies
        exerciseMap[exerciseId] = {
          id: exerciseId,
          label: exerciseData.label,
          value: exerciseData.value,
          order: exerciseData.order,
          tags: tags,
        };

        // Update the set
        exerciseSet.add(exerciseData.value);
        exercisesWithOrder.push({ id: exerciseId, order: exerciseData.order });
      }

      // Sort the exercises by their order and create exerciseList from that order
      exercisesWithOrder.sort((a, b) => a.order - b.order);
      const exercisesList = exercisesWithOrder.map((exercise) => exercise.id);

      set({
        exerciseMap,
        exercisesList,
        exerciseSet,
      });
    } catch (error) {
      console.error('Error fetching exercises from DB:', error);
    }
  },
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
  // ------------------------------------------------------------------------
  // Updating the db first and waiting to see it successful
  updateExerciseList: async (newExercisesList: number[]) => {
    try {
      // Update the db
      await db.transaction(async (tx) => {
        for (const [index, exerciseId] of newExercisesList.entries()) {
          await tx
            .update(schema.exercise)
            .set({ order: index })
            .where(eq(schema.exercise.id, exerciseId));
        }
      });

      // Update the state after successful database update
      set(
        produce<ExerciseStore>((state) => {
          // Update the exercisesList
          state.exercisesList = newExercisesList;

          // Update the exerciseMap
          newExercisesList.forEach((exerciseId, index) => {
            state.exerciseMap[exerciseId].order = index;
          });
        })
      );
    } catch (error) {
      console.error('Error updating exercise list:', error);
    }
  },
  // ------------------------------------------------------------------------
  // // ------------------------------------------------------------------------
  // // OPTIMISTIC UPDATE
  // updateExerciseList: (newExercisesList: number[]) => {
  //   // Store the current state for potential revert
  //   const previousState = {
  //     exercisesList: [...useExerciseStore.getState().exercisesList],
  //     exerciseMap: Object.fromEntries(
  //       Object.entries(useExerciseStore.getState().exerciseMap).map(
  //         ([id, exercise]) => [
  //           id,
  //           {
  //             ...exercise,
  //             tags: new Set(exercise.tags),
  //           },
  //         ]
  //       )
  //     ),
  //   };

  //   // Update the state immediately
  //   set(
  //     produce<ExerciseStore>((state) => {
  //       state.exercisesList = newExercisesList;
  //       newExercisesList.forEach((exerciseId, index) => {
  //         state.exerciseMap[exerciseId].order = index;
  //       });
  //     })
  //   );

  //   // Perform database update asynchronously
  //   db.transaction(async (tx) => {
  //     for (const [index, exerciseId] of newExercisesList.entries()) {
  //       await tx
  //         .update(schema.exercise)
  //         .set({ order: index })
  //         .where(eq(schema.exercise.id, exerciseId));
  //     }
  //   }).catch((error) => {
  //     console.error('Error updating exercise list in database:', error);
  //     // Revert the state
  //     set(
  //       produce<ExerciseStore>((state) => {
  //         state.exercisesList = previousState.exercisesList;
  //         state.exerciseMap = previousState.exerciseMap;
  //       })
  //     );
  //     // Optionally, notify the user about the failure
  //   });
  // },
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
  removeTagFromExercise: (id, tagId) =>
    set(
      produce<ExerciseStore>((state) => {
        state.exerciseMap[id].tags.delete(tagId);
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
    removeTagFromExercise,
    fetchExercisesFromDB,
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
      removeTagFromExercise,
      fetchExercisesFromDB,
    },
  };
}

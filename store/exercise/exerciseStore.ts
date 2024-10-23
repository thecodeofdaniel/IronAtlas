import { create } from 'zustand';
import { produce } from 'immer';
import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import transformDbExercisesToState from './exerciseTransform';

export type ExerciseStateVal = {
  exerciseMap: ExerciseMap;
  exercisesList: number[];
  exerciseSet: Set<string>;
};

export type ExerciseStateFunctions = {
  createExercise: (
    newExercise: schema.TInsertExercise,
    chosenTags: Set<number>
  ) => void;
  updateExerciseList: (newExerciseList: number[]) => void;
  deleteExercise: (id: number) => void;
  updateExercise: (id: number, editedExercise: Exercise) => void;
  removeTagFromExercise: (id: number, tagId: number) => void;
};

type ExerciseStore = ExerciseStateVal & ExerciseStateFunctions;

const starting = transformDbExercisesToState();

export const useExerciseStore = create<ExerciseStore>()((set) => ({
  exerciseMap: starting.exerciseMap,
  exercisesList: starting.exercisesList,
  exerciseSet: starting.exerciseSet,
  createExercise: async (newExercise, chosenTags) => {
    try {
      // Insert exercise
      const [newExerciseFromDb] = await db
        .insert(schema.exercise)
        .values(newExercise)
        .returning();

      // Insert tags related to exercise
      chosenTags.forEach(async (chosenTag) => {
        await db.insert(schema.exerciseTags).values({
          exerciseId: newExerciseFromDb.id,
          tagId: chosenTag,
        });
      });

      set((state) => {
        return {
          exerciseMap: {
            ...state.exerciseMap,
            [newExerciseFromDb.id]: {
              ...newExerciseFromDb,
              tags: chosenTags,
            },
          },
          exercisesList: [newExerciseFromDb.id, ...state.exercisesList],
          exerciseSet: new Set([...state.exerciseSet, newExerciseFromDb.value]),
        };
      });
    } catch (error) {
      console.error('Error: Not able to add exercise', error);
    }
  },
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
    },
  };
}
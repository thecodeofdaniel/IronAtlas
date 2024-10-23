import { create } from 'zustand';
import { produce } from 'immer';
import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
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
  ) => Promise<number | null>;
  updateExerciseList: (newExerciseList: number[]) => Promise<void>;

  /** Return assoicated tagIds with exercise */
  deleteExercise: (id: number) => Promise<number[] | null>;

  updateExercise: (id: number, editedExercise: Exercise) => void;
  removeTagFromExercise: (id: number, tagId: number) => void;
};

type ExerciseStore = ExerciseStateVal & ExerciseStateFunctions;

const starting = transformDbExercisesToState();

export const useExerciseStore = create<ExerciseStore>()((set, get) => ({
  exerciseMap: starting.exerciseMap,
  exercisesList: starting.exercisesList,
  exerciseSet: starting.exerciseSet,
  createExercise: async (newExercise, chosenTags) => {
    let newExerciseId = null;

    try {
      const [newExerciseFromDb] = await db.transaction(async (tx) => {
        // Insert exercise
        const [exercise] = await tx
          .insert(schema.exercise)
          .values(newExercise)
          .returning();

        // Insert tags related to exercise
        await Promise.all(
          Array.from(chosenTags).map((chosenTag) =>
            tx.insert(schema.exerciseTags).values({
              exerciseId: exercise.id,
              tagId: chosenTag,
            })
          )
        );

        return [exercise];
      });

      newExerciseId = newExerciseFromDb.id;

      set((state) => ({
        exerciseMap: {
          ...state.exerciseMap,
          [newExerciseFromDb.id]: {
            ...newExerciseFromDb,
            tags: chosenTags,
          },
        },
        exercisesList: [...state.exercisesList, newExerciseFromDb.id],
        exerciseSet: new Set([...state.exerciseSet, newExerciseFromDb.value]),
      }));
    } catch (error) {
      console.error('Error: Not able to add exercise', error);
    }

    return newExerciseId;
  },
  // ------------------------------------------------------------------------
  // Updating the db first and waiting to see it successful
  updateExerciseList: async (newExercisesList) => {
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
  deleteExercise: async (id) => {
    try {
      // Create new exerciseList
      const newExerciseList = get().exercisesList.filter(
        (exerciseId) => exerciseId !== id
      );

      // Delete exercise in db
      await db.delete(schema.exercise).where(eq(schema.exercise.id, id));

      // Update list and map by updating order
      await get().updateExerciseList(newExerciseList);

      // Delete associated tags with exercise
      const tagIds = await db
        .delete(schema.exerciseTags)
        .where(eq(schema.exerciseTags.exerciseId, id))
        .returning({ tagId: schema.exerciseTags.tagId })
        .then((tags) => tags.map((tag) => tag.tagId));
      // console.log(tagIds);

      set(
        produce<ExerciseStore>((state) => {
          // Remove exercise from set
          const exerciseToBeRemoved = state.exerciseMap[id];
          state.exerciseSet.delete(exerciseToBeRemoved.value);

          // Remove from map
          delete state.exerciseMap[id];
        })
      );

      return tagIds;
    } catch (error) {
      console.error('Error: Deleting Exercise', error);
      return null;
    }
  },
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

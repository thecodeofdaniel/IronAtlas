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
  initExerciseStore: () => void;

  updateExerciseList: (newExerciseList: number[]) => Promise<void>;

  /** Return assoicated tagIds with exercise */
  deleteExercise: (id: number) => Promise<void>;

  createExercise: (
    newExercise: schema.TInsertExercise,
    tagIds: number[]
  ) => void;

  /** Update exercise based on id */
  updateExercise: (
    id: number,
    editedExercise: Exercise,
    tagIds: number[]
  ) => void;
};

type ExerciseStore = ExerciseStateVal & ExerciseStateFunctions;

export const useExerciseStore = create<ExerciseStore>()((set, get) => ({
  exerciseMap: {},
  exercisesList: [],
  exerciseSet: new Set<string>(),
  initExerciseStore: () => {
    const starting = transformDbExercisesToState();

    set({
      exerciseMap: starting.exerciseMap,
      exercisesList: starting.exercisesList,
      exerciseSet: starting.exerciseSet,
    });
  },
  createExercise: async (newExercise, tagIds) => {
    try {
      const [newExerciseFromDb] = await db.transaction(async (tx) => {
        // Insert exercise
        const [exercise] = await tx
          .insert(schema.exercise)
          .values(newExercise)
          .returning();

        // Insert tags associated
        for (const tagId of tagIds) {
          await tx.insert(schema.exerciseTags).values({
            exerciseId: exercise.id,
            tagId: tagId,
          });
        }

        return [exercise];
      });

      set((state) => ({
        exerciseMap: {
          ...state.exerciseMap,
          [newExerciseFromDb.id]: {
            ...newExerciseFromDb,
          },
        },
        exercisesList: [...state.exercisesList, newExerciseFromDb.id],
        exerciseSet: new Set([...state.exerciseSet, newExerciseFromDb.value]),
      }));
    } catch (error) {
      console.error('Error: Not able to add exercise', error);
    }
  },
  updateExerciseList: async (newExercisesList) => {
    try {
      // Update the db
      await db.transaction(async (tx) => {
        for (const [index, exerciseId] of newExercisesList.entries()) {
          await tx
            .update(schema.exercise)
            .set({ index: index })
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
            state.exerciseMap[exerciseId].index = index;
          });
        })
      );
    } catch (error) {
      console.error('Error updating exercise list:', error);
    }
  },
  deleteExercise: async (id) => {
    try {
      await db.transaction(async (tx) => {
        // Delete exercise in exercise table
        await tx.delete(schema.exercise).where(eq(schema.exercise.id, id));

        // Delete exercises from exercise_tags_relations table
        await tx
          .delete(schema.exerciseTags)
          .where(eq(schema.exerciseTags.exerciseId, id));
      });

      // Create new exerciseList
      const newExerciseList = get().exercisesList.filter(
        (exerciseId) => exerciseId !== id
      );

      // Update list and map by updating order
      await get().updateExerciseList(newExerciseList);

      set(
        produce<ExerciseStore>((state) => {
          // Remove exercise from set
          state.exerciseSet.delete(state.exerciseMap[id].value);

          // Remove from map
          delete state.exerciseMap[id];
        })
      );
    } catch (error) {
      console.error('Error: from deleteExercise', error);
    }
  },
  updateExercise: async (id, editedExercise, tagIds) => {
    try {
      await db.transaction(async (tx) => {
        // Update exercise
        await tx
          .update(schema.exercise)
          .set({
            label: editedExercise.label,
            value: editedExercise.value,
          })
          .where(eq(schema.exercise.id, id));

        // Remove all existing tags for this exercise
        await tx
          .delete(schema.exerciseTags)
          .where(eq(schema.exerciseTags.exerciseId, id));

        // Insert new tags (may be the same which is fine)
        for (const tagId of tagIds) {
          await tx.insert(schema.exerciseTags).values({
            exerciseId: id,
            tagId: tagId,
          });
        }
      });

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
      );
    } catch (error) {
      console.error('Error updating exercise in exerciseStore:', error);
    }
  },
}));

export function useExerciseStoreWithSetter(): ExerciseStateVal & {
  setter: ExerciseStateFunctions;
} {
  const {
    exerciseMap,
    exercisesList,
    exerciseSet,
    initExerciseStore,
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
      initExerciseStore,
      createExercise,
      updateExerciseList,
      deleteExercise,
      updateExercise,
    },
  };
}

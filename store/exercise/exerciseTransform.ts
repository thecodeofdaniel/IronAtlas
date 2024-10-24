import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { ExerciseStateVal } from './exerciseStore';

export default function transformDbExercisesToState(): ExerciseStateVal {
  const exerciseMap: ExerciseMap = {};
  const exerciseSet: Set<string> = new Set();
  const exercisesList: number[] = [];

  try {
    const exercisesData = db.select().from(schema.exercise).all();
    const exerciseTagsData = db.select().from(schema.exerciseTags).all();

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
        index: exerciseData.index,
        tags: tags,
      };

      // Update the set
      exerciseSet.add(exerciseData.value);
      exercisesWithOrder.push({ id: exerciseId, order: exerciseData.index });
    }

    // Sort the exercises by their order and create exerciseList from that order
    exercisesWithOrder.sort((a, b) => a.order - b.order);
    // exercisesList = exercisesWithOrder.map((exercise) => exercise.id);
    exercisesWithOrder.map((exercise) => exercisesList.push(exercise.id));
  } catch (error) {
    console.error('Error fetching exercises from DB:', error);
  }

  return {
    exerciseMap,
    exerciseSet,
    exercisesList,
  };
}

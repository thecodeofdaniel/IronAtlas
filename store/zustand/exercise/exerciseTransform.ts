import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { ExerciseStateVal } from './exerciseStore';

export default function transformDbExercisesToState(): ExerciseStateVal {
  const exerciseMap: ExerciseMap = {};
  const exerciseSet: Set<string> = new Set();
  const exercisesList: number[] = [];

  try {
    const dbExercises = db.select().from(schema.exercise).all();

    // Create an array to hold exercise objects with id and index
    const exercisesWithIdAndIndex: { id: number; index: number }[] = [];

    for (const exercise of dbExercises) {
      const exerciseId = exercise.id;

      // Add exercise to map
      exerciseMap[exerciseId] = {
        id: exerciseId,
        label: exercise.label,
        value: exercise.value,
        index: exercise.index,
      };

      // Add exercise to set
      exerciseSet.add(exercise.value);

      // Add object to array
      exercisesWithIdAndIndex.push({
        id: exerciseId,
        index: exercise.index,
      });
    }

    // Sort the exercises by their order and create exerciseList from that order
    exercisesWithIdAndIndex.sort((a, b) => a.index - b.index);
    exercisesWithIdAndIndex.map((exercise) => exercisesList.push(exercise.id));
  } catch (error) {
    console.error('Error fetching exercises from DB:', error);
  }

  return {
    exerciseMap,
    exerciseSet,
    exercisesList,
  };
}

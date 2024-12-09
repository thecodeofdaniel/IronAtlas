import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';
import { ExerciseStateVal } from './exerciseStore';

export default function transformDbExercisesToState(): ExerciseStateVal {
  const exerciseMap: ExerciseMap = {};
  const exerciseSet: Set<string> = new Set();
  const exercisesList: number[] = [];

  try {
    const dbExercises = db
      .select()
      .from(schema.exercise)
      .orderBy(sql`LOWER(${schema.exercise.label})`)
      .all();

    // Now we can just iterate once since the data is already sorted
    for (const [index, exercise] of dbExercises.entries()) {
      const exerciseId = exercise.id;

      exerciseMap[exerciseId] = {
        id: exerciseId,
        label: exercise.label,
        value: exercise.value,
        index: index,
      };

      exerciseSet.add(exercise.value);
      exercisesList.push(exerciseId);
    }
  } catch (error) {
    console.error('Error fetching exercises from DB:', error);
  }

  return {
    exerciseMap,
    exerciseSet,
    exercisesList,
  };
}

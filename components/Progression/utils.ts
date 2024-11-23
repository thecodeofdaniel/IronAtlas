import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db/instance';
import * as s from '@/db/schema';

// Function to get exercise progression data
export async function getExerciseProgression(exerciseId: number) {
  const sets = db
    .select({
      workoutId: s.workout.id,
      date: s.workout.date,
      weight: s.sett.weight,
      reps: s.sett.reps,
      // Calculate volume (weight × reps) for each set
      volume: sql<number>`${s.sett.weight} * ${s.sett.reps}`,
    })
    .from(s.sett)
    .innerJoin(s.volume, eq(s.volume.id, s.sett.volumeId))
    .innerJoin(s.workout, eq(s.workout.id, s.volume.workoutId))
    .where(eq(s.volume.exerciseId, exerciseId))
    .orderBy(desc(s.workout.date))
    .all();

  console.log('Sets length:', sets.length);

  return sets;
}

export type SetData = {
  workoutId: number;
  date: Date;
  weight: number;
  reps: number;
  volume: number;
};

export function analyzeProgression(sets: SetData[]) {
  // Group sets by workoutId instead of date
  const workoutsByWorkoutId = sets.reduce(
    (acc, set) => {
      if (!acc[set.workoutId]) acc[set.workoutId] = [];
      acc[set.workoutId].push(set);
      return acc;
    },
    {} as Record<number, SetData[]>,
  );

  // Calculate metrics for each workout
  const workoutMetrics = Object.entries(workoutsByWorkoutId).map(
    ([workoutId, sets]) => {
      return {
        workoutId: Number(workoutId),
        date: sets[0].date, // Use the date from the first set
        maxWeight: Math.max(...sets.map((s) => s.weight)),
        totalVolume: sets.reduce((sum, set) => sum + set.volume, 0),
        avgReps: sets.reduce((sum, set) => sum + set.reps, 0) / sets.length,
      };
    },
  );

  // Sort by date to analyze trends
  workoutMetrics.sort((a, b) => a.date.getTime() - b.date.getTime());

  return workoutMetrics;
}

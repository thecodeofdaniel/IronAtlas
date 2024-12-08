import { db } from '@/db/instance';
import * as s from '@/db/schema';
import { eq, inArray, sql, desc } from 'drizzle-orm';
import {
  analyzeProgression,
  analyzeTrends,
} from '@/components/Progression/utils';

export type TagProgress = {
  oneRM: {
    total: number;
    percentage: number;
    averagePerDay: number;
  };
  volume: {
    total: number;
    percentage: number;
    averagePerDay: number;
  };
  maxWeight: {
    total: number;
    percentage: number;
    averagePerDay: number;
  };
};

export async function analyzeTagProgress(
  exerciseIds: number[],
): Promise<TagProgress> {
  // Get all sets for all exercises
  const allSets = db
    .select({
      workoutId: s.workout.id,
      date: s.workout.date,
      exerciseId: s.volume.exerciseId,
      weight: s.sett.weight,
      reps: s.sett.reps,
      volume: sql<number>`${s.sett.weight} * ${s.sett.reps}`,
    })
    .from(s.sett)
    .innerJoin(s.volume, eq(s.volume.id, s.sett.volumeId))
    .innerJoin(s.workout, eq(s.workout.id, s.volume.workoutId))
    .where(inArray(s.volume.exerciseId, exerciseIds))
    .orderBy(desc(s.workout.date))
    .all();

  // Group sets by exercise
  const setsByExercise = allSets.reduce(
    (acc, set) => {
      const exerciseId = set.exerciseId;
      if (!acc[exerciseId]) acc[exerciseId] = [];
      acc[exerciseId].push(set);
      return acc;
    },
    {} as Record<number, typeof allSets>,
  );

  // Analyze each exercise
  const exerciseProgress = Object.entries(setsByExercise).map(([_, sets]) => {
    const metrics = analyzeProgression(sets);
    return analyzeTrends(metrics);
  });

  // Aggregate progress across all exercises
  const aggregateProgress = exerciseProgress.reduce(
    (acc, progress) => {
      if (!progress) return acc;

      acc.oneRM.total += progress.oneRMProgress.total;
      acc.oneRM.percentage += progress.oneRMProgress.percentage;
      acc.oneRM.averagePerDay += progress.oneRMProgress.perDay;

      acc.volume.total += progress.volumeProgress.total;
      acc.volume.percentage += progress.volumeProgress.percentage;
      acc.volume.averagePerDay += progress.volumeProgress.perDay;

      acc.maxWeight.total += progress.weightProgress.total;
      acc.maxWeight.percentage += progress.weightProgress.percentage;
      acc.maxWeight.averagePerDay += progress.weightProgress.perDay;

      return acc;
    },
    {
      oneRM: { total: 0, percentage: 0, averagePerDay: 0 },
      volume: { total: 0, percentage: 0, averagePerDay: 0 },
      maxWeight: { total: 0, percentage: 0, averagePerDay: 0 },
    },
  );

  // Average the percentages and per-day values
  const exerciseCount = exerciseProgress.length;
  if (exerciseCount > 0) {
    const metrics = ['oneRM', 'volume', 'maxWeight'] as const;
    metrics.forEach((metric) => {
      aggregateProgress[metric].percentage /= exerciseCount;
      aggregateProgress[metric].averagePerDay /= exerciseCount;
    });
  }

  return aggregateProgress;
}

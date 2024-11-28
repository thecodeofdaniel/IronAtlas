import { db } from '@/db/instance';
import * as s from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export type SetData = {
  workoutId: number;
  date: Date;
  weight: number;
  reps: number;
  volume: number;
};

export type ProgressionMetrics = {
  workoutId: number;
  date: Date;
  maxWeight: number;
  totalVolume: number;
  avgReps: number;
  estimatedOneRM: number;
  personalRecords: {
    [repRange: string]: PRRecord;
  };
  movingAverages: {
    volume: number;
    weight: number;
  };
};

export type PRRecord = {
  weight: number;
  reps: number;
  date: Date;
  workoutId: number;
};

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

  return sets;
}

export function analyzeProgression(sets: SetData[]): ProgressionMetrics[] {
  // Group sets by workoutId
  const workoutsByWorkoutId = sets.reduce(
    (acc, set) => {
      if (!acc[set.workoutId]) acc[set.workoutId] = [];
      acc[set.workoutId].push(set);
      return acc;
    },
    {} as Record<number, SetData[]>,
  );

  // Define rep ranges for PRs (e.g., 1-3, 4-6, 7-10, 11+)
  const repRanges = [
    { name: '1-3', min: 1, max: 3 },
    { name: '4-6', min: 4, max: 6 },
    { name: '7-10', min: 7, max: 10 },
    { name: '11+', min: 11, max: Infinity },
  ];

  // Calculate metrics for each workout
  const workoutMetrics = Object.entries(workoutsByWorkoutId).map(
    ([workoutId, sets]) => {
      // Basic metrics
      const maxWeight = Math.max(...sets.map((s) => s.weight));
      const totalVolume = sets.reduce((sum, set) => sum + set.volume, 0);
      const avgReps =
        sets.reduce((sum, set) => sum + set.reps, 0) / sets.length;

      // Calculate estimated 1RM using Brzycki formula
      // Formula: 1RM = weight × (36 / (37 - reps))
      const oneRMs = sets.map((set) => set.weight * (36 / (37 - set.reps)));
      const estimatedOneRM = Math.max(...oneRMs);

      // Calculate PRs for each rep range
      const personalRecords: { [key: string]: PRRecord } = {};
      repRanges.forEach((range) => {
        const setsInRange = sets.filter(
          (set) => set.reps >= range.min && set.reps <= range.max,
        );
        if (setsInRange.length > 0) {
          const maxSet = setsInRange.reduce((max, set) =>
            set.weight > max.weight ? set : max,
          );
          personalRecords[range.name] = {
            weight: maxSet.weight,
            reps: maxSet.reps,
            date: maxSet.date,
            workoutId: Number(workoutId),
          };
        }
      });

      return {
        workoutId: Number(workoutId),
        date: sets[0].date,
        maxWeight,
        totalVolume,
        avgReps,
        estimatedOneRM,
        personalRecords,
        movingAverages: {
          volume: 0, // Will be calculated after
          weight: 0, // Will be calculated after
        },
      };
    },
  );

  // Sort by date
  workoutMetrics.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate moving averages (using 3 workout window)
  const WINDOW_SIZE = 3;
  workoutMetrics.forEach((metric, index) => {
    if (index >= WINDOW_SIZE - 1) {
      const window = workoutMetrics.slice(index - WINDOW_SIZE + 1, index + 1);
      metric.movingAverages = {
        volume: window.reduce((sum, m) => sum + m.totalVolume, 0) / WINDOW_SIZE,
        weight: window.reduce((sum, m) => sum + m.maxWeight, 0) / WINDOW_SIZE,
      };
    }
  });

  return workoutMetrics;
}

// Helper function to find all-time PRs across workouts
export function findAllTimePRs(metrics: ProgressionMetrics[]) {
  const allTimePRs: { [key: string]: PRRecord } = {};

  metrics.forEach((workout) => {
    Object.entries(workout.personalRecords).forEach(([range, record]) => {
      if (!allTimePRs[range] || record.weight > allTimePRs[range].weight) {
        allTimePRs[range] = record;
      }
    });
  });

  return allTimePRs;
}

// Helper function to analyze trends
export function analyzeTrends(metrics: ProgressionMetrics[]) {
  if (metrics.length < 2) return null;

  const first = metrics[0];
  const last = metrics[metrics.length - 1];
  const timeSpan = last.date.getTime() - first.date.getTime();
  const daysSpan = timeSpan / (1000 * 60 * 60 * 24);

  return {
    weightProgress: {
      total: last.maxWeight - first.maxWeight,
      percentage: ((last.maxWeight - first.maxWeight) / first.maxWeight) * 100,
      perDay: (last.maxWeight - first.maxWeight) / daysSpan,
    },
    volumeProgress: {
      total: last.totalVolume - first.totalVolume,
      percentage:
        ((last.totalVolume - first.totalVolume) / first.totalVolume) * 100,
      perDay: (last.totalVolume - first.totalVolume) / daysSpan,
    },
    oneRMProgress: {
      total: last.estimatedOneRM - first.estimatedOneRM,
      percentage:
        ((last.estimatedOneRM - first.estimatedOneRM) / first.estimatedOneRM) *
        100,
      perDay: (last.estimatedOneRM - first.estimatedOneRM) / daysSpan,
    },
  };
}

// Add this type to your existing types
export type GraphMetric = {
  date: Date;
  value: number;
};

export type GraphData = {
  volume: GraphMetric[];
  oneRM: GraphMetric[];
  maxWeight: GraphMetric[];
  movingAverages: {
    date: Date;
    volume: number;
    weight: number;
  }[];
};

// Add this new function
export function generateGraphMetrics(metrics: ProgressionMetrics[]): GraphData {
  // Sort metrics by date to ensure chronological order
  const sortedMetrics = [...metrics].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return {
    // Total workout volume over time
    volume: sortedMetrics.map((m) => ({
      date: m.date,
      value: m.totalVolume,
    })),

    // Estimated 1RM progression
    oneRM: sortedMetrics.map((m) => ({
      date: m.date,
      value: m.estimatedOneRM,
    })),

    // Max weight used per workout
    maxWeight: sortedMetrics.map((m) => ({
      date: m.date,
      value: m.maxWeight,
    })),

    // Moving averages
    movingAverages: sortedMetrics.map((m) => ({
      date: m.date,
      volume: m.movingAverages.volume,
      weight: m.movingAverages.weight,
    })),
  };
}

import { db } from '@/db/instance';
import * as schema from '@/db/schema';

// Track exercise progress for realistic weight progression
type ExerciseProgress = {
  baseWeight: number; // Starting weight
  currentWeight: number; // Current working weight
  lastPerformance: Date | null;
  consistency: number; // 0-1, affects progression rate
};

export async function createWorkouts() {
  const exercises = await db.select().from(schema.exercise);

  if (!exercises || exercises.length === 0) {
    console.error('No exercises found in database');
    return;
  }

  const now = new Date();
  const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

  // Initialize exercise progress tracking
  const exerciseProgress: Record<number, ExerciseProgress> = {};
  exercises.forEach((exercise) => {
    if (!exercise || !exercise.label) {
      console.error('Invalid exercise found:', exercise);
      return;
    }

    let baseWeight = 45; // Default barbell weight
    switch (exercise.label.toLowerCase()) {
      case 'bench press':
        baseWeight = 95;
        break;
      case 'squats':
        baseWeight = 135;
        break;
      case 'deadlift':
        baseWeight = 155;
        break;
      case 'pullup':
        baseWeight = 0; // Bodyweight
        break;
      // Add more cases as needed
    }

    exerciseProgress[exercise.id] = {
      baseWeight,
      currentWeight: baseWeight,
      lastPerformance: null,
      consistency: Math.random() * 0.3 + 0.7, // 0.7-1.0 consistency
    };
  });

  await db.transaction(async (trx) => {
    // Create ~50 workouts spread across the year
    for (let i = 0; i < 50; i++) {
      const randomDate = new Date(
        oneYearAgo.getTime() +
          Math.random() * (Date.now() - oneYearAgo.getTime()),
      );

      const [workout] = await trx
        .insert(schema.workout)
        .values({
          date: randomDate,
          duration: Math.floor(Math.random() * (90 - 30 + 1) + 30),
          notes: Math.random() < 0.3 ? 'Great workout!' : null,
        })
        .returning();

      const exerciseCount = Math.floor(Math.random() * 4) + 2;
      const shuffledExercises = [...exercises].sort(() => Math.random() - 0.5);
      const workoutExercises = shuffledExercises.slice(0, exerciseCount);

      for (let j = 0; j < workoutExercises.length; j++) {
        const exercise = workoutExercises[j];
        const progress = exerciseProgress[exercise.id];

        const [volume] = await trx
          .insert(schema.volume)
          .values({
            workoutId: workout.id,
            exerciseId: exercise.id,
            index: j,
            subIndex: null,
          })
          .returning();

        // Calculate progression
        if (progress.lastPerformance) {
          const daysSinceLastWorkout =
            (randomDate.getTime() - progress.lastPerformance.getTime()) /
            (1000 * 60 * 60 * 24);

          // Potential for progress if consistent and not too much time between workouts
          if (
            daysSinceLastWorkout < 14 &&
            Math.random() < progress.consistency
          ) {
            // Small progressive overload (0-5 lbs)
            progress.currentWeight += Math.random() * 5;
          } else if (daysSinceLastWorkout > 21) {
            // Deload if too much time has passed
            progress.currentWeight = Math.max(
              progress.baseWeight,
              progress.currentWeight * 0.9,
            );
          }
        }
        progress.lastPerformance = randomDate;

        // Create sets with realistic weight distribution
        const setCount = Math.floor(Math.random() * 3) + 3; // 3-5 sets
        const includeDropSet = Math.random() < 0.2; // 20% chance of including a dropset
        const regularSets = includeDropSet ? setCount - 1 : setCount;

        // Add heavy, low-rep sets at the beginning (30% chance)
        const includeStrengthSets = Math.random() < 0.3;

        if (includeStrengthSets) {
          // Do 1-2 heavy sets with 1-3 reps
          const strengthSetCount = Math.floor(Math.random() * 2) + 1;
          for (let k = 0; k < strengthSetCount; k++) {
            const weight = progress.currentWeight * (1.1 + Math.random() * 0.1); // 110-120% of working weight
            const reps = Math.floor(Math.random() * 3) + 1; // 1-3 reps

            await trx.insert(schema.sett).values({
              volumeId: volume.id,
              type: 'N',
              weight: Math.round(weight),
              reps,
              index: k,
            });
          }

          // Adjust remaining sets to start after strength sets
          for (let k = strengthSetCount; k < regularSets; k++) {
            let weight = progress.currentWeight;
            let reps = 0;

            // Add some variation to working sets
            weight = weight * (0.95 + Math.random() * 0.1); // ±5% variation

            // As weight goes up, reps typically go down
            const maxPossibleReps = Math.max(5, Math.floor(12 - k * 1.5));
            reps = Math.floor(Math.random() * 3) + maxPossibleReps - 2;

            await trx.insert(schema.sett).values({
              volumeId: volume.id,
              type: 'N',
              weight: Math.round(weight),
              reps,
              index: k,
            });
          }
        } else {
          // Original working sets logic
          for (let k = 0; k < regularSets; k++) {
            let weight = progress.currentWeight;
            let reps = 0;

            weight = weight * (0.95 + Math.random() * 0.1);
            const maxPossibleReps = Math.max(5, Math.floor(12 - k * 1.5));
            reps = Math.floor(Math.random() * 3) + maxPossibleReps - 2;

            await trx.insert(schema.sett).values({
              volumeId: volume.id,
              type: 'N',
              weight: Math.round(weight),
              reps,
              index: k,
            });
          }
        }

        // Add dropset if applicable
        if (includeDropSet) {
          await trx.insert(schema.sett).values({
            volumeId: volume.id,
            type: 'D',
            weight: Math.round(progress.currentWeight * 0.6),
            reps: Math.floor(Math.random() * 4) + 8,
            index: regularSets,
          });
        }
      }
    }
  });
}

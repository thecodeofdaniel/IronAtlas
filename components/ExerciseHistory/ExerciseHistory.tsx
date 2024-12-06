import { db } from '@/db/instance';
import * as s from '@/db/schema';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { eq, desc } from 'drizzle-orm';
import { cn } from '@/lib/utils';
import RenderSingleExerciseHistory from './RenderSingleExerciseHistory';

export type TransformedWorkout = {
  workoutId: number;
  workoutDate: Date;
  workoutDuration: number;
  volumes: Array<{
    volumeId: number;
    exerciseId: number;
    index: number;
    subIndex: number | null;
    setts: Array<{
      type: string;
      weight: number | null;
      reps: number | null;
    }>;
  }>;
};

type Props = {
  exerciseId: number;
  className?: string;
};

export default function ExerciseHistory({ exerciseId, className }: Props) {
  const { data: rawWorkouts } = useLiveQuery(
    db
      .select({
        // workout
        workoutId: s.workout.id,
        workoutDate: s.workout.date,
        workoutDuration: s.workout.duration,
        // volume
        volumeId: s.volume.id,
        exerciseId: s.volume.exerciseId,
        index: s.volume.index,
        subIndex: s.volume.subIndex,
        // sett
        setType: s.sett.type,
        weight: s.sett.weight,
        reps: s.sett.reps,
      })
      .from(s.workout)
      .where(eq(s.volume.exerciseId, exerciseId))
      .innerJoin(s.volume, eq(s.volume.workoutId, s.workout.id))
      .innerJoin(s.sett, eq(s.sett.volumeId, s.volume.id))
      .orderBy(desc(s.workout.date)),
  );

  const workouts: TransformedWorkout[] = React.useMemo(() => {
    if (!rawWorkouts) return [];

    const workoutsMap = new Map<number, TransformedWorkout>();

    rawWorkouts.forEach((row) => {
      if (!workoutsMap.has(row.workoutId)) {
        workoutsMap.set(row.workoutId, {
          workoutId: row.workoutId,
          workoutDate: row.workoutDate,
          workoutDuration: row.workoutDuration,
          volumes: [],
        });
      }

      const workout = workoutsMap.get(row.workoutId)!;
      let volume = workout.volumes.find((v) => v.volumeId === row.volumeId);

      if (!volume) {
        volume = {
          volumeId: row.volumeId,
          exerciseId: row.exerciseId,
          index: row.index,
          subIndex: row.subIndex,
          setts: [],
        };
        workout.volumes.push(volume);
      }

      volume.setts.push({
        type: row.setType,
        weight: row.weight,
        reps: row.reps,
      });
    });

    return Array.from(workoutsMap.values());
  }, [rawWorkouts]);

  if (workouts.length === 0) {
    return (
      <View className={cn(className)}>
        <Text className="text-neutral-contrast">No previous history</Text>
      </View>
    );
  }

  return (
    <View className={cn(className)}>
      <FlatList
        data={workouts}
        renderItem={({ item }) => <RenderSingleExerciseHistory item={item} />}
        keyExtractor={(item) => item.workoutId.toString()}
      />
    </View>
  );
}

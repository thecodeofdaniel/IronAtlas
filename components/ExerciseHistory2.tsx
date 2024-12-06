import { db } from '@/db/instance';
import * as s from '@/db/schema';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import React from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { eq, desc } from 'drizzle-orm';
import { Router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import clsx from 'clsx';
import { cn } from '@/lib/utils';
import MyBorder from './ui/MyBorder';
import RenderSetts from './RenderSetts';

type TransformedWorkout = {
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

type RenderWorkoutProps = {
  item: TransformedWorkout;
  index: number;
  exerciseMap: ExerciseMap;
  selected?: number | undefined;
  setSelected?: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function RenderWorkout({ item, index, exerciseMap }: RenderWorkoutProps) {
  return (
    <MyBorder className="my-[1] bg-neutral-accent px-2">
      <Text className="text-lg font-semibold text-neutral-contrast">
        {item.workoutDate.toLocaleDateString()}
      </Text>

      {item.volumes.map((volume) => {
        const exerciseOrder = `${volume.index + 1}${volume.subIndex !== null ? `.${volume.subIndex + 1}` : ''})`;
        return (
          <View key={volume.volumeId} className="flex flex-row gap-2">
            <Text className="text-neutral-contrast">{exerciseOrder}</Text>
            <RenderSetts volume={volume} />
          </View>
        );
      })}
    </MyBorder>
  );
}

type Props = {
  exerciseId: number;
  className?: string;
};

export default function ExerciseHistory2({ exerciseId, className }: Props) {
  const { exerciseMap } = useExerciseStore((state) => state);

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
        renderItem={({ item, index }) => (
          <RenderWorkout item={item} index={index} exerciseMap={exerciseMap} />
        )}
        keyExtractor={(item) => item.workoutId.toString()}
      />
    </View>
  );
}

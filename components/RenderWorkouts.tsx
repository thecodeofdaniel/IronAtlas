import React from 'react';
import { View, Text } from 'react-native';

// DB stuff
import { db } from '@/db/instance';
import * as s from '@/db/schema';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { desc, eq } from 'drizzle-orm';

import { useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';

type TransformedWorkout = {
  workoutId: number;
  workoutDate: Date;
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

export default function RenderWorkouts() {
  console.log('Render RenderWorkouts');
  const router = useRouter();
  const exerciseMap = useExerciseStore((state) => state.exerciseMap);

  const { data: rawWorkouts } = useLiveQuery(
    db
      .select({
        workoutId: s.workout.id,
        workoutDate: s.workout.date,
        volumeId: s.volume.id,
        exerciseId: s.volume.exerciseId,
        index: s.volume.index,
        subIndex: s.volume.subIndex,
        setType: s.sett.type,
        weight: s.sett.weight,
        reps: s.sett.reps,
      })
      .from(s.workout)
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

  console.log(workouts);

  return (
    <GestureHandlerRootView>
      <FlatList
        data={workouts}
        renderItem={({ item, index }) => (
          <View>
            <Text>{item.workoutId}</Text>
          </View>
        )}
        keyExtractor={(item) => item.workoutId.toString()}
      />
    </GestureHandlerRootView>
  );
}

import React from 'react';
import { View, Text, Pressable } from 'react-native';

// DB stuff
import { db } from '@/db/instance';
import * as s from '@/db/schema';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { desc, eq } from 'drizzle-orm';

import { type Router, useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { Ionicons } from '@expo/vector-icons';

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
  router: Router;
  selected?: number | undefined;
  setSelected?: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function RenderWorkout({
  item,
  index,
  exerciseMap,
  router,
}: RenderWorkoutProps) {
  const ssIndexHolder = new Set();
  const { showActionSheetWithOptions } = useActionSheet();
  // const loadTemplate = useWorkoutStore((state) => state.loadTemplate);
  // const loadWorkout = useWorkoutStore((state) => state.loadWorkout);

  const handleOptionsPress = async () => {
    const options = ['Delete', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            await db.delete(s.workout).where(eq(s.workout.id, item.workoutId));
            break;
          // case 1:
          //   loadWorkout(item.workoutId);
          //   router.push({
          //     pathname: '/(tabs)/workout/template/upsertTemplate',
          //     params: {
          //       templateWorkoutId: item.workoutId,
          //       templateWorkoutName: 'Workout',
          //     },
          //   });
          //   break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  return (
    <Pressable className={'my-1 border px-2'}>
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-1">
          <Text className="text-lg font-semibold underline">
            {item.workoutDate.toLocaleDateString()}
          </Text>
        </View>
        <Ionicons
          name="ellipsis-horizontal"
          size={24}
          onPress={handleOptionsPress}
        />
      </View>
      {item.volumes.map(({ volumeId, exerciseId, index, subIndex, setts }) => {
        const exerciseName = ` - ${exerciseMap[exerciseId].label}`;

        const setsDisplay = setts.map((set, idx) => {
          if (!set.weight && !set.reps) return null;

          const weightStr = set.weight ? ` ${set.weight}` : '';
          const repsStr = set.reps ? ` x ${set.reps}` : '';

          return (
            <Text key={idx} className="pl-4 text-sm">
              {`${set.type}${weightStr}${repsStr}`}
            </Text>
          );
        });

        if (subIndex !== null) {
          return (
            <View key={volumeId}>
              {!ssIndexHolder.has(index) && ssIndexHolder.add(index) && (
                <Text className="pl-1 underline">Superset</Text>
              )}
              <Text className="pl-2">{exerciseName}</Text>
              {setsDisplay}
            </View>
          );
        }

        return (
          <View key={volumeId}>
            <Text>{exerciseName}</Text>
            {setsDisplay}
          </View>
        );
      })}
    </Pressable>
  );
}

export default function RenderWorkouts() {
  // console.log('Render RenderWorkouts');
  const router = useRouter();
  const exerciseMap = useExerciseStore((state) => state.exerciseMap);

  const { data: rawWorkouts } = useLiveQuery(
    db
      .select({
        workoutId: s.workout.id,
        workoutDate: s.workout.date,
        workoutDuration: s.workout.duration,
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

  // console.log(workouts);

  return (
    <GestureHandlerRootView>
      <FlatList
        data={workouts}
        renderItem={({ item, index }) => (
          <RenderWorkout
            item={item}
            index={index}
            exerciseMap={exerciseMap}
            router={router}
          />
        )}
        keyExtractor={(item) => item.workoutId.toString()}
      />
    </GestureHandlerRootView>
  );
}

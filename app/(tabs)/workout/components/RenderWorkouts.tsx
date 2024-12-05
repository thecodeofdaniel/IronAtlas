import React from 'react';
import { View, Text, Pressable } from 'react-native';

// DB stuff
import { db } from '@/db/instance';
import * as s from '@/db/schema';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { desc, eq, inArray } from 'drizzle-orm';

import { type Router, useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { Ionicons } from '@expo/vector-icons';
import RenderVolume from './RenderVolume';
import MyButton from '@/components/ui/MyButton';
import MyBorder from '@/components/ui/MyBorder';
import { useThemeContext } from '@/store/context/themeContext';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';

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
  workout: TransformedWorkout;
  index: number;
  exerciseMap: ExerciseMap;
  router: Router;
  selected?: number | undefined;
  setSelected?: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function RenderSingleWorkout({
  workout: workout,
  index,
  exerciseMap,
  router,
}: RenderWorkoutProps) {
  const ssIndexHolder = new Set<number>();
  const { showActionSheetWithOptions } = useActionSheet();
  const { colors } = useThemeContext();

  const handleOptionsPress = async () => {
    const options = ['Delete', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        ...getActionSheetStyle(colors),
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            await db
              .delete(s.workout)
              .where(eq(s.workout.id, workout.workoutId));
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
    <MyBorder className="my-[2] bg-neutral-accent px-2 py-1">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-neutral-contrast">
          {workout.workoutDate.toLocaleDateString()}
        </Text>
        <Ionicons
          name="ellipsis-horizontal"
          size={24}
          color={colors['--neutral-contrast']}
          onPress={handleOptionsPress}
        />
      </View>
      {workout.volumes.map((volume) => (
        <RenderVolume
          key={volume.volumeId}
          exerciseMap={exerciseMap}
          superSettIndexHolder={ssIndexHolder}
          volume={volume}
        />
      ))}
    </MyBorder>
  );
}

type Props = {
  className?: string;
  numberOfWorkouts?: number;
};

export default function RenderWorkouts({ className, numberOfWorkouts }: Props) {
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
      .where(
        inArray(
          s.workout.id,
          db
            .select({ id: s.workout.id })
            .from(s.workout)
            .orderBy(desc(s.workout.date))
            .limit(numberOfWorkouts ?? 999999),
        ),
      )
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

  return (
    <GestureHandlerRootView>
      <FlatList
        data={workouts}
        renderItem={({ item: workout, index }) => (
          <RenderSingleWorkout
            workout={workout}
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

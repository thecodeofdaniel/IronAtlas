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

type Props = {
  uuid: string;
};

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
  const ssIndexHolder = new Set();
  // const { showActionSheetWithOptions } = useActionSheet();
  // const loadTemplate = useWorkoutStore((state) => state.loadTemplate);
  // const loadWorkout = useWorkoutStore((state) => state.loadWorkout);

  // const handleOptionsPress = async () => {
  //   const options = ['Delete', 'Cancel'];
  //   const destructiveButtonIndex = 0;
  //   const cancelButtonIndex = options.length - 1;

  //   showActionSheetWithOptions(
  //     {
  //       options,
  //       cancelButtonIndex,
  //       destructiveButtonIndex,
  //     },
  //     async (selectedIndex?: number) => {
  //       switch (selectedIndex) {
  //         case destructiveButtonIndex:
  //           await db.delete(s.workout).where(eq(s.workout.id, item.workoutId));
  //           break;
  //         // case 1:
  //         //   loadWorkout(item.workoutId);
  //         //   router.push({
  //         //     pathname: '/(tabs)/workout/template/upsertTemplate',
  //         //     params: {
  //         //       templateWorkoutId: item.workoutId,
  //         //       templateWorkoutName: 'Workout',
  //         //     },
  //         //   });
  //         //   break;
  //         case cancelButtonIndex:
  //           break;
  //       }
  //     },
  //   );
  // };

  return (
    <Pressable className={'my-1 border px-2'}>
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-1">
          <Text className="text-lg font-semibold underline">
            {item.workoutDate.toLocaleDateString()}
          </Text>
        </View>
        {/* <Ionicons
          name="ellipsis-horizontal"
          size={24}
          // onPress={handleOptionsPress}
        /> */}
      </View>
      {item.volumes.map(({ volumeId, exerciseId, index, subIndex, setts }) => {
        const exerciseName = ` - ${exerciseMap[exerciseId].label}`;

        const setsDisplay = setts.map((set, idx) => {
          return (
            <Text key={idx} className="pl-4 text-sm">
              {`${set.type}: ${set.weight} x ${set.reps}`}
            </Text>
          );
        });

        if (subIndex !== null) {
          return (
            <View key={volumeId}>
              {!ssIndexHolder.has(index) && ssIndexHolder.add(index) && (
                <Text className="pl-1 underline">Superset</Text>
              )}
              {/* <Text className="pl-2">{exerciseName}</Text> */}
              {setsDisplay}
            </View>
          );
        }

        return (
          <View key={volumeId}>
            {/* <Text>{exerciseName}</Text> */}
            {setsDisplay}
          </View>
        );
      })}
    </Pressable>
  );
}

export default function ExerciseHistory({ uuid }: Props) {
  const { template } = useWorkoutStore((state) => state);
  const { exerciseMap } = useExerciseStore((state) => state);
  const exerciseId = template[uuid].exerciseId!; // exerciseId should not be null

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

  // console.log('Workouts from exerciseHistory', workouts);

  if (workouts.length === 0) {
    return (
      <View>
        <Text>No previous history</Text>
      </View>
    );
  }

  return (
    // <GestureHandlerRootView style={{ borderColor: 'red', borderWidth: 2 }}>
    <View>
      <FlatList
        data={workouts}
        renderItem={({ item, index }) => (
          <RenderWorkout item={item} index={index} exerciseMap={exerciseMap} />
        )}
        keyExtractor={(item) => item.workoutId.toString()}
      />
    </View>

    // </GestureHandlerRootView>
  );
}

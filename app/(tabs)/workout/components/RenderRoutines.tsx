import React from 'react';
import { View } from 'react-native';
import { Router, useRouter } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '@/db/instance';
import * as s from '@/db/schema/routine';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { asc, eq } from 'drizzle-orm';
import { useExerciseStore } from '@/store/zustand/exercise/exerciseStore';
import { Ionicons } from '@expo/vector-icons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTemplateStore } from '@/store/zustand/template/templateStore';
import { useThemeContext } from '@/store/context/themeContext';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';
import { cn } from '@/lib/utils';
import TextContrast from '@/components/ui/TextContrast';
import MyButton from '@/components/ui/MyButton';
import RenderVolume from '@/components/Template/RenderVolume';

export interface TransformedTemplate {
  workoutId: number;
  name: string;
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
}

type RenderItemProps = {
  workout: TransformedTemplate;
  index: number;
  exerciseMap: ExerciseMap;
  router: Router;
  selected?: number | undefined;
  setSelected?: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function RenderSingleRoutine({
  workout: workout,
  index,
  exerciseMap,
  router,
  selected,
  setSelected,
}: RenderItemProps) {
  const ssIndexHolder = new Set<number>();
  const { showActionSheetWithOptions } = useActionSheet();
  const loadTemplate = useTemplateStore((state) => state.loadRoutine);
  const { colors } = useThemeContext();

  const handleOptionsPress = async () => {
    const options = ['Delete', 'Edit', 'Cancel'];
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
            await db.transaction(async (tx) => {
              await tx
                .delete(s.routine)
                .where(eq(s.routine.id, workout.workoutId));
            });
            break;
          case 1:
            loadTemplate(workout.workoutId);
            router.push({
              pathname: '/(tabs)/workout/routines/upsertRoutine',
              params: {
                templateWorkoutId: workout.workoutId,
                templateWorkoutName: workout.name,
              },
            });
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  return (
    <MyButton
      className={cn('my-1 bg-neutral-accent px-2', {
        'border-green-500': selected === workout.workoutId,
      })}
      onPress={() => (setSelected ? setSelected(workout.workoutId) : null)}
    >
      <View className="flex flex-row items-center justify-between">
        <TextContrast className="text-xl font-semibold">
          {workout.name}
        </TextContrast>
        <Ionicons
          name="ellipsis-horizontal"
          size={24}
          color={colors['--neutral-contrast']}
          onPress={handleOptionsPress}
        />
      </View>
      <FlatList
        data={workout.volumes}
        renderItem={({ item }) => (
          <RenderVolume
            volume={item}
            exerciseMap={exerciseMap}
            superSettIndexHolder={ssIndexHolder}
          />
        )}
        keyExtractor={(item) => item.volumeId.toString()}
      />
    </MyButton>
  );
}

type Props = {
  selected?: number | undefined;
  setSelected?: React.Dispatch<React.SetStateAction<number | undefined>>;
};

export default function RenderRoutines({ selected, setSelected }: Props) {
  const router = useRouter();
  const exerciseMap = useExerciseStore((state) => state.exerciseMap);

  // Fetch the workout templates
  const { data: rawRoutines } = useLiveQuery(
    db
      .select({
        workoutId: s.routine.id,
        name: s.routine.name,
        volumeId: s.volumeRoutine.id,
        exerciseId: s.volumeRoutine.exerciseId,
        index: s.volumeRoutine.index,
        subIndex: s.volumeRoutine.subIndex,
        setType: s.settRoutine.type,
        weight: s.settRoutine.weight,
        reps: s.settRoutine.reps,
      })
      .from(s.routine)
      .innerJoin(s.volumeRoutine, eq(s.volumeRoutine.routineId, s.routine.id))
      .leftJoin(
        s.settRoutine,
        eq(s.settRoutine.volumeRoutineId, s.volumeRoutine.id),
      )
      .orderBy(asc(s.routine.name)),
  );

  // Transform the flat data into nested structure
  const routines: TransformedTemplate[] = React.useMemo(() => {
    if (!rawRoutines) return [];

    const routinesMap = new Map<number, TransformedTemplate>();

    rawRoutines.forEach((row) => {
      if (!routinesMap.has(row.workoutId)) {
        routinesMap.set(row.workoutId, {
          workoutId: row.workoutId,
          name: row.name,
          volumes: [],
        });
      }

      const routine = routinesMap.get(row.workoutId)!;
      let volume = routine.volumes.find((v) => v.volumeId === row.volumeId);

      if (!volume) {
        volume = {
          volumeId: row.volumeId,
          exerciseId: row.exerciseId,
          index: row.index,
          subIndex: row.subIndex,
          setts: [],
        };
        routine.volumes.push(volume);
      }

      // Check if a sett was included in a volume
      if (row.setType) {
        volume.setts.push({
          type: row.setType,
          weight: row.weight,
          reps: row.reps,
        });
      }
    });

    return Array.from(routinesMap.values());
  }, [rawRoutines]);

  return (
    <>
      <GestureHandlerRootView>
        <FlatList
          data={routines}
          renderItem={({ item, index }) => (
            <RenderSingleRoutine
              workout={item}
              index={index}
              exerciseMap={exerciseMap}
              router={router}
              selected={selected}
              setSelected={setSelected}
            />
          )}
          keyExtractor={(item) => item.workoutId.toString()}
        />
      </GestureHandlerRootView>
    </>
  );
}

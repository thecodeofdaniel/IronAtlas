import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Router, Stack, useRouter } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '@/db/instance';
import * as s from '@/db/schema/template';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { asc, eq } from 'drizzle-orm';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import { Ionicons } from '@expo/vector-icons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { useThemeContext } from '@/store/context/themeContext';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';
import { cn } from '@/lib/utils';
import TextContrast from '@/components/ui/TextContrast';
import MyButton from '@/components/ui/MyButton';
import RenderVolume from './RenderVolume';

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

function RenderSingleTemplate({
  workout: workout,
  index,
  exerciseMap,
  router,
  selected,
  setSelected,
}: RenderItemProps) {
  const ssIndexHolder = new Set<number>();
  const { showActionSheetWithOptions } = useActionSheet();
  const loadTemplate = useWorkoutStore((state) => state.loadTemplate);
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
                .delete(s.workoutTemplate)
                .where(eq(s.workoutTemplate.id, workout.workoutId));
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

export default function RenderTemplates({ selected, setSelected }: Props) {
  // console.log('Render SelectTemplate');

  const router = useRouter();
  const exerciseMap = useExerciseStore((state) => state.exerciseMap);

  // Fetch the workout templates
  const { data: rawWorkoutTemplates } = useLiveQuery(
    db
      .select({
        workoutId: s.workoutTemplate.id,
        name: s.workoutTemplate.name,
        volumeId: s.volumeTemplate.id,
        exerciseId: s.volumeTemplate.exerciseId,
        index: s.volumeTemplate.index,
        subIndex: s.volumeTemplate.subIndex,
        setType: s.settTemplate.type,
        weight: s.settTemplate.weight,
        reps: s.settTemplate.reps,
      })
      .from(s.workoutTemplate)
      .innerJoin(
        s.volumeTemplate,
        eq(s.volumeTemplate.workoutTemplateId, s.workoutTemplate.id),
      )
      .leftJoin(
        s.settTemplate,
        eq(s.settTemplate.volumeTemplateId, s.volumeTemplate.id),
      )
      .orderBy(asc(s.workoutTemplate.name)),
  );

  // Transform the flat data into nested structure
  const workoutTemplates: TransformedTemplate[] = React.useMemo(() => {
    if (!rawWorkoutTemplates) return [];

    const templatesMap = new Map<number, TransformedTemplate>();

    rawWorkoutTemplates.forEach((row) => {
      if (!templatesMap.has(row.workoutId)) {
        templatesMap.set(row.workoutId, {
          workoutId: row.workoutId,
          name: row.name,
          volumes: [],
        });
      }

      const template = templatesMap.get(row.workoutId)!;
      let volume = template.volumes.find((v) => v.volumeId === row.volumeId);

      if (!volume) {
        volume = {
          volumeId: row.volumeId,
          exerciseId: row.exerciseId,
          index: row.index,
          subIndex: row.subIndex,
          setts: [],
        };
        template.volumes.push(volume);
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

    return Array.from(templatesMap.values());
  }, [rawWorkoutTemplates]);

  return (
    <>
      <GestureHandlerRootView>
        <FlatList
          data={workoutTemplates}
          renderItem={({ item, index }) => (
            <RenderSingleTemplate
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

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

interface TransformedTemplate {
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
  item: TransformedTemplate;
  index: number;
  exerciseMap: ExerciseMap;
  router: Router;
  selected?: number | undefined;
  setSelected?: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function RenderItem({
  item,
  index,
  exerciseMap,
  router,
  selected,
  setSelected,
}: RenderItemProps) {
  const ssIndexHolder = new Set();
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
                .where(eq(s.workoutTemplate.id, item.workoutId));
            });
            break;
          case 1:
            loadTemplate(item.workoutId);
            router.push({
              pathname: '/(tabs)/workout/template/upsertTemplate',
              params: {
                templateWorkoutId: item.workoutId,
                templateWorkoutName: item.name,
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
        'bg-neutral-accent/60': selected === item.workoutId,
      })}
      onPress={() => (setSelected ? setSelected(item.workoutId) : null)}
    >
      <View className="flex flex-row items-center justify-between">
        <TextContrast className="text-xl font-semibold">
          {item.name}
        </TextContrast>
        <Ionicons
          name="ellipsis-horizontal"
          size={24}
          color={colors['--neutral-contrast']}
          onPress={handleOptionsPress}
        />
      </View>
      {item.volumes.map(({ volumeId, exerciseId, index, subIndex, setts }) => {
        const exerciseName = `• ${exerciseMap[exerciseId].label}`;

        const setsLength = setts.length;

        const setsDisplay = setts.map((set, idx) => {
          if (!set.weight && !set.reps) return null;

          const repsStr = set.reps;
          const comma = idx >= setsLength - 1 ? '' : ', ';

          // If only reps are included
          if (!set.weight && set.reps) {
            return (
              <Text
                key={idx}
                className={cn('text-sm text-neutral-contrast/70', {
                  'text-purple-400/70': set.type === 'D',
                })}
              >
                {`${repsStr}${comma}`}
              </Text>
            );
          }

          const weightStr = `${set.weight}`;

          // If only weight is included
          if (set.weight && set.reps) {
            return (
              <Text
                key={idx}
                className={cn('text-sm text-neutral-contrast/70', {
                  'text-purple-400/70': set.type === 'D',
                })}
              >
                {`${weightStr} x ${repsStr}${comma}`}
              </Text>
            );
          }
        });

        // If set is part of a superset
        if (subIndex !== null) {
          return (
            <View key={volumeId}>
              {!ssIndexHolder.has(index) && ssIndexHolder.add(index) && (
                <View className="flex flex-row">
                  <Text> </Text>
                  <Text className="pl-1 text-neutral-contrast/80 underline">
                    {'Superset'}
                  </Text>
                </View>
              )}
              <Text className="pl-2 text-neutral-contrast/80">
                {exerciseName}
              </Text>
              <View className="flex flex-row pl-4">{setsDisplay}</View>
            </View>
          );
        }

        return (
          <View key={volumeId}>
            <Text className="text-neutral-contrast/80">{exerciseName}</Text>
            <View className={cn('flex flex-row pl-2')}>{setsDisplay}</View>
          </View>
        );
      })}
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
      .innerJoin(
        s.settTemplate,
        eq(s.settTemplate.volumeTemplateId, s.volumeTemplate.id),
      )
      .orderBy(asc(s.workoutTemplate.createdAt)),
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

      volume.setts.push({
        type: row.setType,
        weight: row.weight,
        reps: row.reps,
      });
    });

    return Array.from(templatesMap.values());
  }, [rawWorkoutTemplates]);

  return (
    <>
      <GestureHandlerRootView>
        <FlatList
          data={workoutTemplates}
          renderItem={({ item, index }) => (
            <RenderItem
              item={item}
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

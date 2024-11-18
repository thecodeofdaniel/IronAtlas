import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Router, Stack, useRouter } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '@/db/instance';
import * as sch from '@/db/schema/template';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { asc, eq } from 'drizzle-orm';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import { volume } from '@/db/schema/workout';
import { Ionicons } from '@expo/vector-icons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import clsx from 'clsx';

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
  selected: number | undefined;
  setSelected: React.Dispatch<React.SetStateAction<number | undefined>>;
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

  const handleOptionsPress = async () => {
    const options = ['Delete', 'Edit', 'Cancel'];
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
            await db.transaction(async (tx) => {
              await tx
                .delete(sch.workoutTemplate)
                .where(eq(sch.workoutTemplate.id, item.workoutId));
            });
            console.log('Delete workoutId', item.workoutId);
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
    <Pressable
      className={clsx('my-1 border px-2', {
        'bg-green-500': selected === index,
      })}
      onPress={() => setSelected(index)}
    >
      <View className="flex flex-row items-center justify-between">
        <Text className="text-lg font-semibold underline">{item.name}</Text>
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

export default function SelectTemplate() {
  console.log('Render SelectTemplate');
  const [selected, setSelected] = useState<number>();

  const router = useRouter();
  const exerciseMap = useExerciseStore((state) => state.exerciseMap);
  const { clearTemplate, loadTemplate } = useWorkoutStore((state) => state);

  // Fetch the workout templates
  const { data: rawWorkoutTemplates } = useLiveQuery(
    db
      .select({
        workoutId: sch.workoutTemplate.id,
        name: sch.workoutTemplate.name,
        volumeId: sch.volumeTemplate.id,
        exerciseId: sch.volumeTemplate.exerciseId,
        index: sch.volumeTemplate.index,
        subIndex: sch.volumeTemplate.subIndex,
        setType: sch.settTemplate.type,
        weight: sch.settTemplate.weight,
        reps: sch.settTemplate.reps,
      })
      .from(sch.workoutTemplate)
      .innerJoin(
        sch.volumeTemplate,
        eq(sch.volumeTemplate.workoutTemplateId, sch.workoutTemplate.id),
      )
      .innerJoin(
        sch.settTemplate,
        eq(sch.settTemplate.volumeTemplateId, sch.volumeTemplate.id),
      )
      .orderBy(asc(sch.workoutTemplate.createdAt)),
  );

  console.log(rawWorkoutTemplates);

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
      <Stack.Screen options={{ title: 'Select Template' }} />
      <View className="flex-1 p-2">
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
      </View>
      <View className="flex flex-row justify-between gap-2 p-2">
        <Pressable
          disabled={selected === undefined}
          className="flex-1 bg-green-500 p-4"
          onPress={() => {
            if (selected === undefined) return;

            loadTemplate(workoutTemplates[selected].workoutId);
            router.back();
          }}
          style={{ opacity: selected === undefined ? 0.3 : 1 }}
        >
          <Text className="text-center">Pick Template</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-blue-500 p-4"
          onPress={() => {
            clearTemplate();
            router.push('/workout/template/upsertTemplate');
          }}
        >
          <Text className="text-center">Create Template</Text>
        </Pressable>
      </View>
    </>
  );
}

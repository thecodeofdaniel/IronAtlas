import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '@/db/instance';
import * as sch from '@/db/schema/template';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { eq } from 'drizzle-orm';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import { volume } from '@/db/schema/workout';
import { Ionicons } from '@expo/vector-icons';
import { useActionSheet } from '@expo/react-native-action-sheet';

interface TransformedTemplate {
  workoutId: number;
  name: string;
  volumes: Array<{
    volumeId: number;
    exerciseId: number; // null if volume is a superset
    index: number;
    subIndex: number | null;
  }>;
}

type RenderItemProps = {
  item: TransformedTemplate;
  exerciseMap: ExerciseMap;
};

function RenderItem({ item, exerciseMap }: RenderItemProps) {
  const ssIndexHolder = new Set();
  const { showActionSheetWithOptions } = useActionSheet();

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
            // await db
            //   .delete(sch.workoutTemplate)
            //   .where(eq(sch.workoutTemplate.id, item.workoutId));
            await db.transaction(async (tx) => {
              await tx
                .delete(sch.workoutTemplate)
                .where(eq(sch.workoutTemplate.id, item.workoutId));
            });
            console.log('Delete workoutId', item.workoutId);
            break;
          case 1:
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  return (
    <View className="border">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-lg font-semibold underline">{item.name}</Text>
        <Ionicons
          name="ellipsis-horizontal"
          size={24}
          onPress={handleOptionsPress}
        />
      </View>
      {item.volumes.map(({ volumeId, exerciseId, index, subIndex }) => {
        const exerciseName = ` - ${exerciseMap[exerciseId].label}`;

        if (subIndex !== null) {
          return (
            <View key={volumeId}>
              {!ssIndexHolder.has(index) && ssIndexHolder.add(index) && (
                <Text className="pl-1 underline">Superset</Text>
              )}
              <Text className="pl-2">{exerciseName}</Text>
            </View>
          );
        }

        return (
          <View key={volumeId}>
            <Text>{exerciseName}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function SelectTemplate() {
  const router = useRouter();
  const { exerciseMap } = useExerciseStore((state) => state);

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
      })
      .from(sch.workoutTemplate)
      .innerJoin(
        sch.volumeTemplate,
        eq(sch.volumeTemplate.workoutTemplateId, sch.workoutTemplate.id),
      ),
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
      template.volumes.push({
        volumeId: row.volumeId,
        exerciseId: row.exerciseId,
        index: row.index,
        subIndex: row.subIndex,
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
            renderItem={({ item }) => (
              <RenderItem item={item} exerciseMap={exerciseMap} />
            )}
            keyExtractor={(item) => item.workoutId.toString()}
          />
        </GestureHandlerRootView>
      </View>
      <View className="flex flex-row justify-between gap-2 p-2">
        <Pressable
          className="flex-1 bg-green-500 p-4"
          onPress={() => router.back()}
        >
          <Text className="text-center">Pick Template</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-blue-500 p-4"
          onPress={() => router.push('/workout/template/createTemplate')}
        >
          <Text className="text-center">Create Template</Text>
        </Pressable>
      </View>
    </>
  );
}

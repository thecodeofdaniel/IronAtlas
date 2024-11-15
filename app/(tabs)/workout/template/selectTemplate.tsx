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

interface TransformedTemplate {
  id: number;
  name: string;
  volumes: Array<{
    exerciseId: number; // null if volume is a superset
    index: number;
    subIndex: number | null;
  }>;
}

export default function SelectTemplate() {
  const router = useRouter();
  const { exerciseMap } = useExerciseStore((state) => state);

  // Fetch the workout templates
  const { data: rawWorkoutTemplates } = useLiveQuery(
    db
      .select({
        id: sch.workoutTemplate.id,
        name: sch.workoutTemplate.name,
        exerciseId: sch.volumeTemplate.exerciseId,
        index: sch.volumeTemplate.index,
        subIndex: sch.volumeTemplate.subIndex,
      })
      .from(sch.workoutTemplate)
      .innerJoin(
        // changed from leftJoin
        sch.volumeTemplate,
        eq(sch.volumeTemplate.workoutTemplateId, sch.workoutTemplate.id),
      ),
  );

  // Transform the flat data into nested structure
  const workoutTemplates: TransformedTemplate[] = React.useMemo(() => {
    if (!rawWorkoutTemplates) return [];

    const templatesMap = new Map<number, TransformedTemplate>();

    rawWorkoutTemplates.forEach((row) => {
      if (!templatesMap.has(row.id)) {
        templatesMap.set(row.id, {
          id: row.id,
          name: row.name,
          volumes: [],
        });
      }

      const template = templatesMap.get(row.id)!;
      template.volumes.push({
        exerciseId: row.exerciseId,
        index: row.index,
        subIndex: row.subIndex,
      });
    });

    return Array.from(templatesMap.values());
  }, [rawWorkoutTemplates]);

  const renderItem = ({ item }: { item: TransformedTemplate }) => {
    const ssIndexHolder = new Set();

    return (
      <View className="border">
        <Text className="text-lg font-semibold underline">{item.name}</Text>
        {item.volumes.map(({ exerciseId, index, subIndex }) => {
          const exerciseName = ` - ${exerciseMap[exerciseId].label}`;

          if (subIndex !== null) {
            return (
              <View>
                {!ssIndexHolder.has(index) && ssIndexHolder.add(index) && (
                  <Text className="pl-1 underline">Superset</Text>
                )}
                <Text key={`${index}-${subIndex}`} className="pl-2">
                  {exerciseName}
                </Text>
              </View>
            );
          }
          return <Text key={index}>{exerciseName}</Text>;
        })}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Select Template' }} />
      <View className="flex-1">
        <GestureHandlerRootView>
          <FlatList
            data={workoutTemplates}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </GestureHandlerRootView>
      </View>
      <View className="flex flex-row justify-between">
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

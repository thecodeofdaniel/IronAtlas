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

  return (
    <View className="border">
      <Text className="text-lg font-semibold underline">{item.name}</Text>
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

  // const renderItem = ({ item }: { item: TransformedTemplate }) => {
  //   const ssIndexHolder = new Set();

  //   return (
  //     <View className="border">
  //       <Text className="text-lg font-semibold underline">{item.name}</Text>
  //       {item.volumes.map(({ exerciseId, index, subIndex }) => {
  //         const exerciseName = ` - ${exerciseMap[exerciseId].label}`;

  //         if (subIndex !== null) {
  //           return (
  //             <View>
  //               {!ssIndexHolder.has(index) && ssIndexHolder.add(index) && (
  //                 <Text className="pl-1 underline">Superset</Text>
  //               )}
  //               <Text key={`${index}-${subIndex}`} className="pl-2">
  //                 {exerciseName}
  //               </Text>
  //             </View>
  //           );
  //         }
  //         return <Text key={index}>{exerciseName}</Text>;
  //       })}
  //     </View>
  //   );
  // };

  return (
    <>
      <Stack.Screen options={{ title: 'Select Template' }} />
      <View className="flex-1">
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

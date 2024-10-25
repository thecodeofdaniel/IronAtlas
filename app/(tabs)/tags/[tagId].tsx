import { db } from '@/db/instance';
import { useTagStoreWithSetter } from '@/store/tag/tagStore';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import * as schema from '@/db/schema';
import { inArray } from 'drizzle-orm';

function getAllChildrenIds(tagMap: TagMap, tagId: number): number[] {
  const tag = tagMap[tagId];

  // If tag does not have children then return
  if (tag.children.length === 0) {
    return [];
  }

  const childrenIds = tag.children;
  const grandchildrenIds = tag.children.flatMap((childId) =>
    getAllChildrenIds(tagMap, childId)
  );

  return [...childrenIds, ...grandchildrenIds];
}

export default function TagId() {
  const { tagId: id } = useLocalSearchParams<{ tagId: string }>();
  const { tagMap } = useTagStoreWithSetter();

  const currentTag = tagMap[+id];
  const allChildrenIds = useMemo(
    () => getAllChildrenIds(tagMap, +id),
    [tagMap, id]
  );

  const allTagIds = [+id, ...allChildrenIds];

  const exercises = useMemo(() => {
    return db
      .select({
        exerciseId: schema.exerciseTags.exerciseId,
        tagId: schema.exerciseTags.tagId,
      })
      .from(schema.exerciseTags)
      .where(inArray(schema.exerciseTags.tagId, allTagIds))
      .all();
  }, [allTagIds]);

  const exerciseIds = Array.from(
    new Set(exercises.map((exercise) => exercise.exerciseId))
  );

  console.log(exerciseIds);

  const exercisesByTag = useMemo(() => {
    return exercises.reduce<Record<number, number[]>>(
      (acc, { exerciseId, tagId }) => {
        if (!acc[tagId]) acc[tagId] = [];
        acc[tagId].push(exerciseId);
        return acc;
      },
      {}
    );
  }, [exercises]);

  return (
    <>
      <Stack.Screen
        options={{
          title: currentTag.label,
          headerBackTitle: 'Back',
        }}
      />
      <View>
        <Text>Current Tag Exercises: {exercisesByTag[+id]?.length || 0}</Text>
        <Text>All Children:</Text>
        <FlatList
          data={allChildrenIds}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <View>
              <Text className="text-black">{tagMap[item].label}</Text>
              <Text className="text-gray-600">
                Exercises: {exercisesByTag[item]?.length || 0}
              </Text>
            </View>
          )}
        />
      </View>
    </>
  );
}

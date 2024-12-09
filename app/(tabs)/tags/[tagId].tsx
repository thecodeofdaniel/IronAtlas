import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useTagStoreHook } from '@/store/zustand/tag/tagStore';
import { useExerciseStore } from '@/store/zustand/exercise/exerciseStore';

import MyButtonOpacity from '@/components/ui/MyButtonOpacity';

// db stuff
import { db } from '@/db/instance';
import * as s from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { analyzeTagProgress, TagProgress } from './utils';
import MyBorder from '@/components/ui/MyBorder';
import OverallProgress from './OverallProgress';

function getAllChildrenIds(tagMap: TagMap, tagId: number): number[] {
  const tag = tagMap[tagId];

  // If tag does not have children then return
  if (tag.children.length === 0) {
    return [];
  }

  const childrenIds = tag.children;
  const grandchildrenIds = tag.children.flatMap((childId) =>
    getAllChildrenIds(tagMap, childId),
  );

  return [...childrenIds, ...grandchildrenIds];
}

export default function TagId() {
  console.log('Render TagId screen');
  const { tagId: id } = useLocalSearchParams<{ tagId: string }>();
  const { exerciseMap } = useExerciseStore((state) => state);
  const { tagMap } = useTagStoreHook();

  const currentTag = tagMap[+id];
  const allChildrenIds = useMemo(
    () => getAllChildrenIds(tagMap, +id),
    [tagMap, id],
  );

  const allTagIds = [+id, ...allChildrenIds];

  const exercises = useMemo(() => {
    return db
      .select({
        exerciseId: s.exerciseTags.exerciseId,
        tagId: s.exerciseTags.tagId,
        label: s.exercise.label,
      })
      .from(s.exerciseTags)
      .innerJoin(s.exercise, eq(s.exercise.id, s.exerciseTags.exerciseId))
      .where(eq(s.exerciseTags.tagId, +id))
      .orderBy(s.exercise.label)
      .all();
  }, [id]);

  const childrenExercises = useMemo(() => {
    if (allChildrenIds.length === 0) return [];
    return db
      .select({
        exerciseId: s.exerciseTags.exerciseId,
        tagId: s.exerciseTags.tagId,
        label: s.exercise.label,
      })
      .from(s.exerciseTags)
      .innerJoin(s.exercise, eq(s.exercise.id, s.exerciseTags.exerciseId))
      .where(inArray(s.exerciseTags.tagId, allChildrenIds))
      .orderBy(s.exercise.label)
      .all();
  }, [allChildrenIds]);

  const exerciseIds = useMemo(
    () =>
      Array.from(
        new Set(exercises?.map((exercise) => exercise.exerciseId) ?? []),
      ),
    [exercises],
  );

  const childrenExerciseIds = useMemo(
    () =>
      Array.from(
        new Set(
          childrenExercises?.map((exercise) => exercise.exerciseId) ?? [],
        ),
      ),
    [childrenExercises],
  );

  const allExerciseIds = useMemo(
    () => [...exerciseIds, ...childrenExerciseIds],
    [exerciseIds, childrenExerciseIds],
  );

  const [tagProgress, setTagProgress] = useState<TagProgress | null>(null);

  // Fetch progress data
  useEffect(() => {
    if (allExerciseIds.length > 0) {
      analyzeTagProgress(allExerciseIds).then(setTagProgress);
    }
  }, [allExerciseIds]);

  return (
    <>
      <Stack.Screen
        options={{
          title: currentTag.label,
          headerBackTitle: 'Back',
        }}
      />
      <View className="flex-1 gap-2 bg-neutral p-2">
        {/* Progress Overview */}
        {tagProgress && <OverallProgress tagProgress={tagProgress} />}

        {exerciseIds.length === 0 && childrenExerciseIds.length === 0 && (
          <View>
            <Text className="text-neutral-contrast">
              No exercises related to this tag :(
            </Text>
          </View>
        )}
        {exerciseIds.length > 0 && (
          <View className="gap-1">
            <Text className="text-xl font-medium text-neutral-contrast">
              Exercises
            </Text>
            <FlatList
              data={exerciseIds}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <MyButtonOpacity className="my-[1] bg-neutral-accent">
                  <Text className="text-neutral-contrast">
                    {exerciseMap[item].label}
                  </Text>
                </MyButtonOpacity>
              )}
            />
          </View>
        )}
        {childrenExerciseIds.length > 0 && (
          <View className="gap-1">
            <Text className="text-lg font-medium text-neutral-contrast">
              Children Exercises
            </Text>
            <FlatList
              data={childrenExerciseIds}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <MyButtonOpacity className="my-[1] bg-neutral-accent">
                  <Text className="text-neutral-contrast">
                    {exerciseMap[item].label}
                  </Text>
                </MyButtonOpacity>
              )}
            />
          </View>
        )}
      </View>
    </>
  );
}

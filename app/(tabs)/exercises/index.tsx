import { db } from '@/db/instance';
import {
  ExerciseStateFunctions,
  useExerciseStoreWithSetter,
} from '@/store/zustand/exercise/exerciseStore';
import { useModalStore } from '@/store/zustand/modal/modalStore';
import {
  useTagStoreWithSetter,
  type TagStateFunctions,
} from '@/store/zustand/tag/tagStore';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as schema from '@/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import { getAllChildrenIds } from '@/utils/utils';
import MultiDropDown from '@/components/MultiDropDown';
import { useFilterExerciseStore } from '@/store/zustand/filterExercises/filterExercisesStore';
import { useThemeContext } from '@/store/context/themeContext';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import TextContrast from '@/components/ui/TextContrast';

type ExerciseListProps = {
  exerciseMap: ExerciseMap;
  exerciseList: number[];
  exerciseSetter: ExerciseStateFunctions;
  tagMap: TagMap;
  tagSetter: TagStateFunctions;
  isDraggable: boolean;
};

function ExerciseList({
  exerciseMap,
  exerciseList,
  exerciseSetter,
  tagMap,
  tagSetter,
  isDraggable,
}: ExerciseListProps) {
  const { colors } = useThemeContext();
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);

  const router = useRouter();

  // Transform IDs into Exercise objects
  const exercises = useMemo(
    () =>
      exerciseList
        .map((id) => exerciseMap[id])
        .filter((exercise): exercise is Exercise => exercise !== undefined),
    [exerciseList, exerciseMap],
  );

  const handleOnPress = (exercise: Exercise) => {
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
            exerciseSetter.deleteExercise(exercise.id);
            break;
          case 1:
            openModal('upsertExercise', {
              id: exercise.id,
            });
            router.push('/modal');
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  const renderItem = ({
    item: exercise,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Exercise>) => {
    const index = getIndex()!;

    return (
      <Link
        href={{
          pathname: '/(tabs)/exercises/[exerciseId]',
          params: { exerciseId: exercise.id },
        }}
        asChild
      >
        <MyButtonOpacity
          activeOpacity={1}
          onLongPress={isDraggable ? drag : undefined}
          disabled={isActive}
          className={clsx('my-[1] flex flex-row px-2', {
            'bg-red-500': isActive,
            'bg-primary': !isActive,
          })}
        >
          <View className="flex flex-1 flex-row justify-between">
            <Text className="text-white">{exercise.label}</Text>
            <Pressable onPress={() => handleOnPress(exercise)}>
              <Ionicons name="ellipsis-horizontal" color="white" size={24} />
            </Pressable>
          </View>
        </MyButtonOpacity>
      </Link>
    );
  };

  return (
    <View className="flex-1">
      <GestureHandlerRootView>
        <DraggableFlatList
          data={exercises}
          onDragEnd={({ data }) => {
            // Convert Exercise objects back to ID array when updating store
            const newOrder = data.map((exercise) => exercise.id);
            exerciseSetter.updateExerciseList(newOrder);
          }}
          keyExtractor={(exercise) => exercise.id.toString()}
          renderItem={renderItem}
        />
      </GestureHandlerRootView>
    </View>
  );
}

export default function ExercisesTab() {
  // console.log('Render Exercises Tab');
  const router = useRouter();
  const { colors } = useThemeContext();
  const { exerciseMap, exercisesList, setter } = useExerciseStoreWithSetter();
  const { tagMap, setter: tagSetter } = useTagStoreWithSetter();
  const openModal = useModalStore((state) => state.openModal);

  // const [selectedTags, setSelected] = useState<string[]>([]);
  const selectedTags = useFilterExerciseStore((state) => state.selectedTags);

  let filteredExercises = exercisesList;

  // If the number of selected tags is greater than one then filter
  if (selectedTags.length > 0) {
    const allTagIds = selectedTags.flatMap((tagId) => [
      +tagId,
      ...getAllChildrenIds(tagMap, +tagId),
    ]);

    filteredExercises = [
      ...new Set(
        db
          .select({
            exerciseId: schema.exerciseTags.exerciseId,
            index: schema.exercise.index,
          })
          .from(schema.exerciseTags)
          .innerJoin(
            schema.exercise,
            eq(schema.exerciseTags.exerciseId, schema.exercise.id),
          )
          .where(inArray(schema.exerciseTags.tagId, allTagIds))
          .orderBy(asc(schema.exercise.index))
          .all()
          .map((result) => result.exerciseId),
      ),
    ];
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Exercises',
          headerShown: true,
          headerRight: () => {
            return (
              <TouchableOpacity
                onPress={() => {
                  openModal('upsertExercise', {});
                  router.push('/modal');
                }}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={colors['--neutral-contrast']}
                />
              </TouchableOpacity>
            );
          },
        }}
      />
      <ScreenLayoutWrapper>
        <MultiDropDown />
        {selectedTags.length === 0 && exercisesList.length === 0 && (
          <View className="flex-1 items-center justify-center">
            <TextContrast>No Exercises Found</TextContrast>
            <MyButtonOpacity>
              <Text className="font-medium text-white">Add Exercises</Text>
            </MyButtonOpacity>
          </View>
        )}
        {selectedTags.length > 0 && filteredExercises.length === 0 && (
          <View className="flex-1 items-center justify-center">
            <TextContrast>No Exercises Found!</TextContrast>
          </View>
        )}
        {filteredExercises.length > 0 && (
          <ExerciseList
            exerciseMap={exerciseMap}
            exerciseList={filteredExercises}
            exerciseSetter={setter}
            tagMap={tagMap}
            tagSetter={tagSetter}
            isDraggable={exercisesList.length === filteredExercises.length}
          />
        )}
      </ScreenLayoutWrapper>
    </>
  );
}

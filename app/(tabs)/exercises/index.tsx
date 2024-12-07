import { db } from '@/db/instance';
import {
  ExerciseStateFunctions,
  useExerciseStoreHook,
} from '@/store/zustand/exercise/exerciseStore';
import { useModalStore } from '@/store/zustand/modal/modalStore';
import {
  useTagStoreHook,
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
import ExerciseListWrapper from '@/components/ExerciseList/ExerciseListWrapper';
import filterExercises from '@/db/funcs/filterExercises';

type ExerciseListProps = {
  exerciseMap: ExerciseMap;
  exerciseList: number[];
  exerciseSetter: ExerciseStateFunctions;
  isDraggable: boolean;
};

function ExerciseList({
  exerciseMap,
  exerciseList,
  exerciseSetter,
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
  const router = useRouter();
  const { colors } = useThemeContext();
  const { exerciseMap, exercisesList, setter } = useExerciseStoreHook();
  const { tagMap } = useTagStoreHook();
  const openModal = useModalStore((state) => state.openModal);

  const selectedTags = useFilterExerciseStore((state) => state.selectedTags);
  const filteredExercises =
    selectedTags.length > 0
      ? filterExercises(tagMap, selectedTags)
      : exercisesList;

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
        <ExerciseListWrapper
          selectedTags={selectedTags}
          exercisesList={exercisesList}
          filteredExercises={filteredExercises}
        >
          <ExerciseList
            exerciseMap={exerciseMap}
            exerciseList={filteredExercises}
            exerciseSetter={setter}
            isDraggable={exercisesList.length === filteredExercises.length}
          />
        </ExerciseListWrapper>
      </ScreenLayoutWrapper>
    </>
  );
}

import { db } from '@/db/instance';
import {
  ExerciseStateFunctions,
  useExerciseStoreWithSetter,
} from '@/store/exercise/exerciseStore';
import { ModalData, useModalStore } from '@/store/modalStore';
import {
  useTagStoreWithSetter,
  type TagStateFunctions,
} from '@/store/tag/tagStore';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { Stack, useRouter } from 'expo-router';
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
import { useFilterExerciseStore } from '@/store/filterExercises/filterExercisesStore';
import { useGeneralStore } from '@/store/general/generalStore';
import { useWorkoutStore } from '@/store/workout/workoutStore';

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
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);
  const router = useRouter();
  // const { pickedExercises, pushExerciseId, popExerciseId } = useGeneralStore(
  //   (state) => state,
  // );
  const { pickedExercises, pushExerciseId, popExerciseId } = useWorkoutStore(
    (state) => state,
  );

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

    const pickedExercisePlace = pickedExercises.indexOf(exercise.id) + 1;
    const pickedExercisesLen = pickedExercises.length;

    let indicator = 'th';

    if (pickedExercisePlace === 1) {
      indicator = 'st';
    } else if (pickedExercisePlace === 2) {
      indicator = 'nd';
    } else if (pickedExercisePlace === 3) {
      indicator = 'rd';
    }

    // const isIncluded = pickedExercises.includes(exercise.id);
    // const isTopOfStack = pickedExercises.at(-1) === exercise.id;

    const isIncluded = pickedExercisePlace !== 0;
    const isTopOfStack =
      pickedExercisesLen > 0 && pickedExercisePlace === pickedExercisesLen;

    return (
      <Pressable
        onPress={() => {
          if (!isIncluded) pushExerciseId(exercise.id);
          if (isTopOfStack) popExerciseId();
        }}
        // activeOpacity={1}
        // onLongPress={isDraggable ? drag : undefined}
        // disabled={isActive}
        className={clsx('my-[1] flex flex-row bg-blue-500 p-2', {
          'bg-red-200': isIncluded,
          'bg-red-500': isTopOfStack,
        })}
      >
        <View className="flex flex-1 flex-row justify-between">
          <Text className="text-white">{exercise.label}</Text>
          {pickedExercisePlace > 0 && (
            <Text className="text-white">
              {pickedExercisePlace}
              {indicator}
            </Text>
          )}

          {/* <TouchableOpacity onPress={() => handleOnPress(exercise)}>
            <Ionicons
              name="ellipsis-horizontal-outline"
              color="white"
              size={24}
            />
          </TouchableOpacity> */}
        </View>
      </Pressable>
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

type SelectExercisesModalProps = {
  modalData: ModalData['selectExercises'];
  closeModal: () => void;
};

export default function SelectExercisesModal({
  modalData,
}: SelectExercisesModalProps) {
  console.log('Render SelectExercisesModal');
  const router = useRouter();
  const { exerciseMap, exercisesList, setter } = useExerciseStoreWithSetter();
  const { tagMap } = useTagStoreWithSetter();

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

  const {
    pickedExercises,
    template,
    clearExercises,
    addExercises,
    addSuperset,
  } = useWorkoutStore((state) => state);

  console.log(template);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select',
          headerLeft: () => (
            <Pressable
              className="border"
              onPress={() => {
                addSuperset(pickedExercises);
                clearExercises();
                router.back();
              }}
            >
              <Text>Add superset</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              className="border"
              onPress={() => {
                addExercises(pickedExercises);
                clearExercises();
                router.back();
              }}
            >
              <Text>Add exercise(s)</Text>
            </Pressable>
          ),
        }}
      />
      <View className="m-2 flex flex-1 flex-col gap-2">
        <Pressable onPress={clearExercises}>
          <Text>Clear stack</Text>
        </Pressable>
        <View>
          <Text>{JSON.stringify(pickedExercises)}</Text>
        </View>
        <MultiDropDown />
        {filteredExercises.length === 0 ? (
          <View>
            <Text>No exercises found :(</Text>
          </View>
        ) : (
          <ExerciseList
            exerciseMap={exerciseMap}
            exerciseList={filteredExercises}
            exerciseSetter={setter}
            isDraggable={exercisesList.length === filteredExercises.length}
          />
        )}
      </View>
    </>
  );
}

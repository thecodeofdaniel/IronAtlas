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
import { View, Text, TouchableOpacity } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as schema from '@/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import { getAllChildrenIds } from '@/utils/utils';
import MultiDropDown from '@/components/MultiDropDown';
import { useFilterExerciseStore } from '@/store/filterExercises/filterExercisesStore';

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
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={isDraggable ? drag : undefined}
        disabled={isActive}
        className={clsx('my-[1] flex flex-row p-2', {
          'bg-red-500': isActive,
          'bg-blue-800': !isActive,
        })}
      >
        <View className="flex flex-1 flex-row justify-between">
          <Text className="text-white">
            {exercise.label} @{index}
          </Text>
          {/* <TouchableOpacity onPress={() => handleOnPress(exercise)}>
            <Ionicons
              name="ellipsis-horizontal-outline"
              color="white"
              size={24}
            />
          </TouchableOpacity> */}
        </View>
      </TouchableOpacity>
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
  console.log('Render Exercises Tab');
  const router = useRouter();
  const { exerciseMap, exercisesList, exerciseSet, setter } =
    useExerciseStoreWithSetter();
  const { tagMap, setter: tagSetter } = useTagStoreWithSetter();
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);

  const handlePress = () => {
    const options = ['Add Exercise', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            // openModal('createExercise');
            openModal('upsertExercise', {});
            router.push('/modal');
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  // Fetch tags initially until tagMap updates
  const tags = useMemo(() => {
    console.log('Run this function');
    return db
      .select({ label: schema.tag.label, value: schema.tag.id })
      .from(schema.tag)
      .orderBy(asc(schema.tag.label))
      .all()
      .map((tag) => ({
        ...tag,
        value: String(tag.value),
      }));
  }, [tagMap]);

  // const [selected, setSelected] = useState<string[]>(modalData.tags);
  // const setSelected = modalData.setTags;

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
          title: 'Choose Exercises',
        }}
      />
      <View className="m-2 flex flex-1 flex-col gap-2">
        <MultiDropDown
          tags={tags}
          selected={modalData.selectedTags}
          // setSelected={modalData.setSelectedTags}
        />
        {filteredExercises.length === 0 ? (
          <View>
            <Text>No exercises found :(</Text>
          </View>
        ) : (
          <ExerciseList
            exerciseMap={exerciseMap}
            exerciseList={filteredExercises}
            exerciseSetter={setter}
            tagMap={tagMap}
            tagSetter={tagSetter}
            isDraggable={exercisesList.length === filteredExercises.length}
          />
        )}
      </View>
    </>
  );
}

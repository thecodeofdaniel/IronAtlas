import { db } from '@/db/instance';
import {
  ExerciseStateFunctions,
  useExerciseStoreWithSetter,
} from '@/store/exercise/exerciseStore';
import { useModalStore } from '@/store/modalStore';
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
import DropDownPicker from 'react-native-dropdown-picker';
import { asc, eq, inArray } from 'drizzle-orm';
import { getAllChildrenIds } from '@/utils/utils';
import {
  MultipleSelectList,
  SelectList,
} from 'react-native-dropdown-select-list';

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
  console.log('Render ExerciseList');
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);
  const router = useRouter();

  // Transform IDs into Exercise objects
  const exercises = useMemo(
    () =>
      exerciseList
        .map((id) => exerciseMap[id])
        .filter((exercise): exercise is Exercise => exercise !== undefined),
    [exerciseList, exerciseMap]
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
            // // Grab each tag from set and remove associated exercise from tag
            // [...exercise.tags].forEach((tagId) => {
            //   // console.log(tagMap[tagId]);
            //   return tagSetter.deleteExerciseFromTagState(tagId, exercise.id);
            // });

            // Remove the exercise from exercise list
            const tagIds = await exerciseSetter.deleteExercise(exercise.id);

            // Remove exercise from associated tag
            if (tagIds) {
              tagIds.forEach((tagId) =>
                // Remove associated exercise with tag
                tagSetter.deleteExerciseFromTagState(tagId, exercise.id)
              );
            }
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
      }
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
        className={clsx('p-2 my-[1] flex flex-row', {
          'bg-red-500': isActive,
          'bg-blue-800': !isActive,
        })}
      >
        <View className="flex flex-row justify-between flex-1">
          <Text className="text-white">
            {exercise.label} @{index}
          </Text>
          <TouchableOpacity onPress={() => handleOnPress(exercise)}>
            <Ionicons
              name="ellipsis-horizontal-outline"
              color="white"
              size={24}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 border">
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
  console.log('Render Exercises Tab');
  const router = useRouter();
  const { exerciseMap, exercisesList, exerciseSet, setter } =
    useExerciseStoreWithSetter();
  const { tagMap, setter: tagSetter } = useTagStoreWithSetter();
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);

  console.log(exerciseSet);

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
      }
    );
  };

  // const tags = db
  //   .select({ label: schema.tag.label, value: schema.tag.id })
  //   .from(schema.tag)
  //   .orderBy(asc(schema.tag.label))
  //   .all();

  const tags = db
    .select({ key: schema.tag.id, value: schema.tag.label })
    .from(schema.tag)
    .orderBy(asc(schema.tag.label))
    .all();

  const [open, setOpen] = useState(false);
  const [selectedTagIds, setSelectedTags] = useState<number[]>([]);
  const [tagItems, setTagItems] = useState(tags);
  const [selected, setSelected] = React.useState('');

  console.log(selectedTagIds);

  let filteredExercises = exercisesList;

  if (selectedTagIds.length > 0) {
    console.log('selectedtags', selectedTagIds);

    const allTagIds = selectedTagIds.flatMap((tagId) => [
      tagId,
      ...getAllChildrenIds(tagMap, tagId),
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
            eq(schema.exerciseTags.exerciseId, schema.exercise.id)
          )
          .where(inArray(schema.exerciseTags.tagId, allTagIds))
          .orderBy(asc(schema.exercise.index))
          .all()
          .map((result) => result.exerciseId)
      ),
    ];

    console.log(filteredExercises);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Exercises',
          headerShown: true,
          headerRight: () => {
            return (
              <TouchableOpacity onPress={handlePress}>
                <Ionicons name="add" size={24} />
              </TouchableOpacity>
            );
          },
        }}
      />
      <View className="flex-1 m-2">
        <View className="flex flex-row gap-1">
          <View className="flex-1">
            <MultipleSelectList
              setSelected={setSelectedTags}
              data={tags}
              save="key"
              label="Tags"
              // placeholder="Select tags to filter"
              // boxStyles={{ backgroundColor: 'red' }}
              // dropdownItemStyles={{ backgroundColor: 'green', marginVertical: 1 }}
              // dropdownStyles={{ backgroundColor: 'purple' }}
              badgeStyles={{ backgroundColor: 'blue' }}
              // boxStyles={{backgroundColor: 'green', flex: 1, flexDirection: 'row'}}
            />
          </View>
        </View>
        <ExerciseList
          exerciseMap={exerciseMap}
          exerciseList={filteredExercises}
          exerciseSetter={setter}
          tagMap={tagMap}
          tagSetter={tagSetter}
          isDraggable={exercisesList.length === filteredExercises.length}
        />
      </View>
    </>
  );
}

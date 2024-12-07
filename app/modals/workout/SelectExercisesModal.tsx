import { db } from '@/db/instance';
import {
  useExerciseStore,
  useExerciseStoreWithSetter,
} from '@/store/zustand/exercise/exerciseStore';
import { ModalData } from '@/store/zustand/modal/modalStore';
import {
  useTagStore,
  useTagStoreWithSetter,
} from '@/store/zustand/tag/tagStore';

import clsx from 'clsx';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import * as schema from '@/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import { getAllChildrenIds } from '@/utils/utils';
import MultiDropDown from '@/components/MultiDropDown';
import { useFilterExerciseStore } from '@/store/zustand/filterExercises/filterExercisesStore';
import {
  useTemplateStore,
  useWorkoutStoreHook,
  TemplateStateFunctions,
  TemplateStateVal,
} from '@/store/zustand/template/templateStore';
import AddExercisesOrSuperset from './components/AddExercisesOrSuperset';
import MyButton from '@/components/ui/MyButton';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';

type ExerciseListProps = {
  exerciseMap: ExerciseMap;
  exerciseList: number[];
  pickedExercises: TemplateStateVal['pickedExercises'];
  pickedExercisesSet: TemplateStateVal['pickedExercisesSet'];
  actions: TemplateStateFunctions;
};

function ExerciseList({
  exerciseMap,
  exerciseList,
  pickedExercises,
  pickedExercisesSet,
  actions,
}: ExerciseListProps) {
  // Transform IDs into Exercise objects
  const exercises = useMemo(
    () =>
      exerciseList
        .map((id) => exerciseMap[id])
        .filter((exercise): exercise is Exercise => exercise !== undefined),
    [exerciseList, exerciseMap],
  );

  const renderItem = ({ item: exercise }: { item: Exercise }) => {
    const isInArray = pickedExercisesSet.has(exercise.id);
    let pickedExercisePlace;

    if (isInArray)
      pickedExercisePlace = pickedExercises.indexOf(exercise.id) + 1;

    let indicator = 'th';

    if (pickedExercisePlace === 1) {
      indicator = 'st';
    } else if (pickedExercisePlace === 2) {
      indicator = 'nd';
    } else if (pickedExercisePlace === 3) {
      indicator = 'rd';
    }

    return (
      <MyButton
        onPress={() => {
          actions.pickExercise(exercise.id);
        }}
        className={clsx('my-[1] flex flex-row transition-colors', {
          'bg-blue-500': isInArray,
        })}
      >
        <View className="flex flex-1 flex-row justify-between">
          <Text className="text-white">{exercise.label}</Text>
          {pickedExercisePlace && (
            <Text className="text-white">
              {pickedExercisePlace + indicator}
            </Text>
          )}
        </View>
      </MyButton>
    );
  };

  return (
    <View className="flex-1">
      <FlatList
        data={exercises}
        keyExtractor={(exercise) => exercise.id.toString()}
        renderItem={renderItem}
      />
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
  const isSuperset = modalData.isSuperset;
  const storeType = modalData.storeType; // This determines if we're in a workout or creating a template

  const router = useRouter();
  const { exerciseMap, exercisesList } = useExerciseStore((state) => state);
  const tagMap = useTagStore((state) => state.tagMap);
  const selectedTags = useFilterExerciseStore((state) => state.selectedTags);
  // const { pickedExercises, pickedExercisesSet, actions } =
  //   useExerciseSelectionHook(storeType);
  const { pickedExercises, pickedExercisesSet, actions } =
    useWorkoutStoreHook();

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
          title: 'Select',
          headerRight: () => (
            <AddExercisesOrSuperset
              isSuperset={isSuperset}
              pickedExercises={pickedExercises}
              forUUID={modalData.uuid}
              router={router}
              actions={actions}
            />
          ),
        }}
      />
      <View className="flex flex-1 flex-col gap-2 bg-neutral p-2">
        <MultiDropDown />
        {filteredExercises.length === 0 ? (
          <View>
            <Text>No exercises found :(</Text>
          </View>
        ) : (
          <ExerciseList
            exerciseMap={exerciseMap}
            exerciseList={filteredExercises}
            pickedExercises={pickedExercises}
            pickedExercisesSet={pickedExercisesSet}
            actions={actions}
          />
        )}
      </View>
    </>
  );
}

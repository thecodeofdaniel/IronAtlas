import { db } from '@/db/instance';
import {
  useExerciseStore,
  useExerciseStoreHook,
} from '@/store/zustand/exercise/exerciseStore';
import { ModalData } from '@/store/zustand/modal/modalStore';
import { useTagStore, useTagStoreHook } from '@/store/zustand/tag/tagStore';

import clsx from 'clsx';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import * as schema from '@/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import { getAllChildrenIds, placeIndicator } from '@/utils/utils';
import MultiDropDown from '@/components/MultiDropDown';
import { useFilterExerciseStore } from '@/store/zustand/filterExercises/filterExercisesStore';
import {
  useTemplateStore,
  useTemplateStoreHook,
  TemplateStateFunctions,
  TemplateStateVal,
} from '@/store/zustand/template/templateStore';
import AddExercisesOrSuperset from './components/AddExercisesOrSuperset';
import MyButton from '@/components/ui/MyButton';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import ExerciseListWrapper from '@/components/ExerciseList/ExerciseListWrapper';
import filterExercises from '@/db/funcs/filterExercises';

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
              {placeIndicator(pickedExercisePlace)}
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

  const router = useRouter();
  const { exerciseMap, exercisesList } = useExerciseStore((state) => state);
  const tagMap = useTagStore((state) => state.tagMap);
  const { pickedExercises, pickedExercisesSet, actions } =
    useTemplateStoreHook();

  const selectedTags = useFilterExerciseStore((state) => state.selectedTags);
  const filteredExercises =
    selectedTags.length > 0
      ? filterExercises(tagMap, selectedTags)
      : exercisesList;

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
            pickedExercises={pickedExercises}
            pickedExercisesSet={pickedExercisesSet}
            actions={actions}
          />
        </ExerciseListWrapper>
      </ScreenLayoutWrapper>
    </>
  );
}

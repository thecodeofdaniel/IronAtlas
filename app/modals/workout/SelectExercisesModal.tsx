import { db } from '@/db/instance';
import {
  useExerciseStore,
  useExerciseStoreWithSetter,
} from '@/store/exercise/exerciseStore';
import { ModalData } from '@/store/modalStore';
import { useTagStore, useTagStoreWithSetter } from '@/store/tag/tagStore';

import clsx from 'clsx';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import * as schema from '@/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import { getAllChildrenIds } from '@/utils/utils';
import MultiDropDown from '@/components/MultiDropDown';
import { useFilterExerciseStore } from '@/store/filterExercises/filterExercisesStore';
import {
  useWorkoutStore,
  WorkoutStateFunctions,
  WorkoutStateVal,
} from '@/store/workout/workoutStore';
import CreateSuperset from './components/CreateSuperset';
import { useExerciseSelectionHook } from '@/store/exerciseSelection/exerciseSelectionHook';
import AddExercises from './components/AddExercises';
import AddExercisesOrSuperset from './components/AddExercisesOrSuperset';

type ExerciseListProps = {
  exerciseMap: ExerciseMap;
  exerciseList: number[];
  pickedExercises: WorkoutStateVal['pickedExercises'];
  pickedExercisesSet: WorkoutStateVal['pickedExercisesSet'];
  actions: WorkoutStateFunctions;
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
      <Pressable
        onPress={() => {
          actions.pickExercise(exercise.id);
        }}
        className={clsx('my-[1] flex flex-row bg-blue-500 p-2', {
          'bg-red-500': isInArray,
        })}
      >
        <View className="flex flex-1 flex-row justify-between">
          <Text className="text-white">{exercise.label}</Text>
          {pickedExercisePlace && (
            <Text className="text-white">
              {pickedExercisePlace}
              {indicator}
            </Text>
          )}
        </View>
      </Pressable>
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
  const { pickedExercises, pickedExercisesSet, actions } =
    useExerciseSelectionHook(storeType);

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
          // headerLeft: () =>
          //   isSuperset ? null : (
          //     <CreateSuperset
          //       pickedExercises={pickedExercises}
          //       actions={actions}
          //       router={router}
          //     />
          //   ),
          headerRight: () => (
            // <View className="flex flex-row gap-1">
            //   {isSuperset ? null : (
            //     <CreateSuperset
            //       pickedExercises={pickedExercises}
            //       actions={actions}
            //       router={router}
            //     />
            //   )}
            //   <AddExercises
            //     pickedExercises={pickedExercises}
            //     actions={actions}
            //     router={router}
            //     isSuperset={isSuperset}
            //     toExerciseUUID={modalData.uuid}
            //   />
            // </View>
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
      <View className="m-2 flex flex-1 flex-col gap-2">
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

import { db } from '@/db/instance';
import { useExerciseStoreWithSetter } from '@/store/exercise/exerciseStore';
import { ModalData } from '@/store/modalStore';
import { useTagStoreWithSetter } from '@/store/tag/tagStore';

import clsx from 'clsx';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import * as schema from '@/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import { getAllChildrenIds } from '@/utils/utils';
import MultiDropDown from '@/components/MultiDropDown';
import { useFilterExerciseStore } from '@/store/filterExercises/filterExercisesStore';
import { useWorkoutStore } from '@/store/workout/workoutStore';

type ExerciseListProps = {
  exerciseMap: ExerciseMap;
  exerciseList: number[];
};

function ExerciseList({ exerciseMap, exerciseList }: ExerciseListProps) {
  const { pickedExercises, pickedExercisesSet, pickExercise } = useWorkoutStore(
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
          pickExercise(exercise.id);
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

  const router = useRouter();
  const { exerciseMap, exercisesList } = useExerciseStoreWithSetter();
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

  const { pickedExercises, clearExercises, addExercises, addSuperset } =
    useWorkoutStore((state) => state);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select',
          headerLeft: () => {
            if (isSuperset) return null;
            else {
              return (
                <Pressable
                  disabled={pickedExercises.length < 2}
                  style={{
                    borderColor: 'black',
                    borderTopWidth: 1,
                    borderLeftWidth: 1,
                    borderRightWidth: 2,
                    borderBottomWidth: 2,
                  }}
                  className={clsx('bg-blue-500 p-2 transition-opacity', {
                    'opacity-45': pickedExercises.length < 2,
                  })}
                  onPress={() => {
                    addSuperset(pickedExercises);
                    clearExercises();
                    router.back();
                  }}
                >
                  <Text className="font-medium text-white">Add superset</Text>
                </Pressable>
              );
            }
          },
          headerRight: () => (
            <Pressable
              disabled={pickedExercises.length < 1}
              style={{
                borderColor: 'black',
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 2,
                borderBottomWidth: 2,
              }}
              className={clsx('bg-blue-500 p-2 transition-opacity', {
                'opacity-45': pickedExercises.length < 1,
              })}
              onPress={() => {
                if (!isSuperset) addExercises(pickedExercises);
                else addExercises(pickedExercises, modalData.uuid);
                clearExercises();
                router.back();
              }}
            >
              <Text className="font-medium text-white">Add exercise(s)</Text>
            </Pressable>
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
          />
        )}
      </View>
    </>
  );
}

import React from 'react';
import { Text, Pressable } from 'react-native';
import clsx from 'clsx';
import { type WorkoutStateFunctions } from '@/store/workout/workoutStore';
import { type Router } from 'expo-router';

type Props = {
  pickedExercises: number[];
  actions: WorkoutStateFunctions;
  router: Router;
  isSuperset: boolean;
  toExerciseUUID: string;
};

export default function AddExercises({
  pickedExercises,
  actions,
  router,
  isSuperset,
  toExerciseUUID,
}: Props) {
  return (
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
        if (!isSuperset) actions.addExercises(pickedExercises);
        else actions.addExercises(pickedExercises, toExerciseUUID);
        actions.clearPickedExercises();
        router.back();
      }}
    >
      <Text className="font-medium text-white">Add exercise(s)</Text>
    </Pressable>
  );
}

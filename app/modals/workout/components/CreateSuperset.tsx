import React from 'react';
import { Text, Pressable } from 'react-native';
import clsx from 'clsx';
import { type WorkoutStateFunctions } from '@/store/workout/workoutStore';
import { type Router } from 'expo-router';

type Props = {
  pickedExercises: number[];
  actions: WorkoutStateFunctions;
  router: Router;
};

export default function CreateSuperset({
  pickedExercises,
  actions,
  router,
}: Props) {
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
        actions.addSuperset(pickedExercises);
        actions.clearExercises();
        router.back();
      }}
    >
      <Text className="font-medium text-white">Add superset</Text>
    </Pressable>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { Router } from 'expo-router';
import { WorkoutStateFunctions } from '@/store/workout/workoutStore';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import { cn } from '@/lib/utils';

type Props = {
  isSuperset: boolean;
  pickedExercises: number[];
  forUUID: string;
  actions: WorkoutStateFunctions;
  router: Router;
};

export default function AddExercisesOrSuperset({
  isSuperset,
  pickedExercises,
  actions,
  router,
  forUUID,
}: Props) {
  const exercisesSelectedLen = pickedExercises.length;
  const noneAreSel = exercisesSelectedLen < 1;
  const oneIsSel = exercisesSelectedLen < 2;

  return (
    <View className="flex flex-row gap-1">
      {!isSuperset && (
        <MyButtonOpacity
          onPress={() => {
            actions.addSuperset(pickedExercises);
            actions.clearPickedExercises();
            router.back();
          }}
          disabled={oneIsSel}
          className={cn('', {
            'opacity-45': oneIsSel,
          })}
        >
          <Text className="font-medium text-white">Add Superset</Text>
        </MyButtonOpacity>
      )}
      <MyButtonOpacity
        onPress={() => {
          if (!isSuperset) actions.addExercises(pickedExercises);
          else actions.addExercises(pickedExercises, forUUID);
          actions.clearPickedExercises();
          router.back();
        }}
        disabled={noneAreSel}
        className={cn({
          'opacity-45': noneAreSel,
        })}
      >
        <Text className="font-medium text-white">Add Exercise(s)</Text>
      </MyButtonOpacity>
    </View>
  );
}

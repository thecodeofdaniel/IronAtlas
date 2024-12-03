import { View, Text } from 'react-native';
import React from 'react';
import CreateSuperset from './CreateSuperset';
import AddExercises from './AddExercises';
import { Router } from 'expo-router';
import { WorkoutStateFunctions } from '@/store/workout/workoutStore';
import MyButton from '@/components/ui/MyButton';
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
  const atLeastOneSel = exercisesSelectedLen < 1;
  const atLeastTwoSel = exercisesSelectedLen < 2;

  return (
    <View className="flex flex-row gap-1">
      {!isSuperset && (
        <MyButtonOpacity
          onPress={() => {
            actions.addSuperset(pickedExercises);
            actions.clearPickedExercises();
            router.back();
          }}
          disabled={atLeastTwoSel}
          className={cn({
            'opacity-45': atLeastTwoSel,
          })}
        >
          <Text className="font-medium text-neutral-contrast">
            Add Superset
          </Text>
        </MyButtonOpacity>
      )}
      <MyButtonOpacity
        onPress={() => {
          if (!isSuperset) actions.addExercises(pickedExercises);
          else actions.addExercises(pickedExercises, forUUID);
          actions.clearPickedExercises();
          router.back();
        }}
        disabled={atLeastOneSel}
        className={cn({
          'opacity-45': atLeastOneSel,
        })}
      >
        <Text className="font-medium text-neutral-contrast">
          Add Exercise(s)
        </Text>
      </MyButtonOpacity>
    </View>
  );
}

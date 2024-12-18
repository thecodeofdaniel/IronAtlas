import React from 'react';
import { View, Text } from 'react-native';
import { Router } from 'expo-router';
import { TemplateStateFunctions } from '@/store/zustand/template/templateStore';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import { cn } from '@/lib/utils';

type Props = {
  isSuperset: boolean;
  pickedExercises: number[];
  forUUID: string;
  actions: TemplateStateFunctions;
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
  const noneAreSel = exercisesSelectedLen === 0;
  const noneOrOneIsSel = exercisesSelectedLen <= 1;

  return (
    <View className="flex flex-row gap-1">
      {!isSuperset && (
        <MyButtonOpacity
          onPress={() => {
            actions.addSuperset(pickedExercises);
            actions.clearPickedExercises();
            router.back();
          }}
          disabled={noneOrOneIsSel}
          className={cn({
            'opacity-45': noneOrOneIsSel,
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

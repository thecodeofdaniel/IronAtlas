import { View, Text } from 'react-native';
import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import SetsTable from '@/components/SetsTable/SetsTable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Exercise() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const { template } = useWorkoutStore((state) => state);
  const { exerciseMap } = useExerciseStore((state) => state);

  const exerciseId = template[uuid].exerciseId;
  const title = exerciseId ? exerciseMap[exerciseId].label : 'Superset';

  return (
    <>
      <Stack.Screen
        options={{
          title: title,
        }}
      />
      <GestureHandlerRootView>
        <SetsTable uuid={uuid} />
      </GestureHandlerRootView>
    </>
  );
}

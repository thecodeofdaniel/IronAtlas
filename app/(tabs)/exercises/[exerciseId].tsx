import React from 'react';
import { View, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useExerciseStore } from '@/store/zustand/exercise/exerciseStore';
import Progression from '@/components/Progression/Progression';
import ExerciseHistory from '@/components/ExerciseHistory/ExerciseHistory';

export default function ExerciseId() {
  // console.log('Render ExerciseId');
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { exerciseMap } = useExerciseStore((state) => state);

  return (
    <>
      <Stack.Screen options={{ title: exerciseMap[+exerciseId].label }} />
      <View className="flex-1 bg-neutral p-4">
        <Text className="text-2xl font-semibold text-neutral-contrast">
          Workout History
        </Text>
        <ExerciseHistory exerciseId={+exerciseId} />
        <Progression exerciseId={+exerciseId} />
      </View>
    </>
  );
}

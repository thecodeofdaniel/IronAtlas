import React from 'react';
import { View, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import ExerciseHistory2 from '@/components/ExerciseHistory2';
import Progression from '@/components/Progression/Progression';

export default function ExerciseId() {
  // console.log('Render ExerciseId');
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { exerciseMap } = useExerciseStore((state) => state);

  return (
    <>
      <Stack.Screen options={{ title: exerciseMap[+exerciseId].label }} />
      <View className="p-4">
        <Text className="text-2xl font-semibold">Workout History</Text>
        <ExerciseHistory2 exerciseId={+exerciseId} />
        <Progression exerciseId={+exerciseId} />
      </View>
    </>
  );
}

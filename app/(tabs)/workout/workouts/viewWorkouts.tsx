import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import RenderWorkouts from '@/components/RenderWorkouts';

export default function ViewWorkouts() {
  return (
    <>
      <Stack.Screen options={{ title: 'Workouts' }} />
      <View className="flex-1 p-2">
        <RenderWorkouts />
      </View>
    </>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function WorkoutTab() {
  return (
    <>
      <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
      <View>
        <Text>Workout tab</Text>
      </View>
    </>
  );
}

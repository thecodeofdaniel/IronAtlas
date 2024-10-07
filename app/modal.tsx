import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

export default function Modal() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Move' }} />
      <View>
        <Text>modal</Text>
      </View>
    </>
  );
}

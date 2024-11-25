import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

export default function SettingsTab() {
  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View>
        <Text>index</Text>
      </View>
    </>
  );
}

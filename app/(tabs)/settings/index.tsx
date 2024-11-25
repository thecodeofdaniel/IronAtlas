import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { useThemeContext } from '@/store/context/themeContext';

export default function SettingsTab() {
  const { themeName, setTheme } = useThemeContext();
  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View className="flex flex-1 flex-col items-center justify-center gap-2">
        <Text>Current theme: {themeName}</Text>
        <Pressable onPress={setTheme} className="bg-primary border px-4 py-2">
          <Text className="text-neutral-accent">
            Set {themeName === 'light' ? 'dark' : 'light'} theme
          </Text>
        </Pressable>
      </View>
    </>
  );
}

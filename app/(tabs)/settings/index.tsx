import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeContext } from '@/store/context/themeContext';
import Button from '@/components/ui/MyButton';

export default function SettingsTab() {
  const { themeName, setTheme } = useThemeContext();

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View className="bg-neutral flex flex-1 flex-col items-center justify-center gap-2">
        <Text className="text-neutral-contrast text-xl">
          Current theme: {themeName}
        </Text>
        <Button onPress={setTheme}>
          <Text className="text-neutral-contrast text-xl">
            Set {themeName === 'light' ? 'dark' : 'light'} theme
          </Text>
        </Button>
      </View>
    </>
  );
}

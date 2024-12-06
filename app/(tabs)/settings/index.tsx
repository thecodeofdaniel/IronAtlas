import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeContext } from '@/store/context/themeContext';
import Button from '@/components/ui/MyButton';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';
import { deleteWorkouts } from '@/db/reset';

export default function SettingsTab() {
  const { colors, themeName, setTheme } = useThemeContext();
  const { showActionSheetWithOptions } = useActionSheet();

  const handleDeleteWorkouts = () => {
    const options = ['Delete', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        title: 'Proceed With Caution!',
        message: 'This will delete all previous workout history!',
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        ...getActionSheetStyle(colors),
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            Alert.alert(
              'Are you sure?',
              'All previous workout history will be deleted',
              [
                { text: 'Cancel' },
                { text: 'Yes', onPress: () => deleteWorkouts() },
              ],
            );
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View className="flex-1 bg-neutral p-2">
        <Text className="text-xl text-neutral-contrast">
          Current Theme: {themeName}
        </Text>
        <Button onPress={setTheme}>
          <Text className="text-center text-xl text-white">
            Set {themeName === 'light' ? 'dark' : 'light'} theme
          </Text>
        </Button>
        <Button onPress={handleDeleteWorkouts}>
          <Text className="text-center text-xl text-neutral-contrast">
            Delete All Previous Workouts
          </Text>
        </Button>
      </View>
    </>
  );
}

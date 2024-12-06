import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeContext } from '@/store/context/themeContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';
import { deleteWorkouts } from '@/db/reset';
import Button from '@/components/ui/MyButton';

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
      <View className="flex flex-1 flex-col gap-2 bg-neutral p-2">
        <View className="flex flex-row items-center gap-2">
          <Text className="w-40 text-xl font-medium text-neutral-contrast">
            Theme Settings
          </Text>
          <Button onPress={setTheme} className="flex-1 bg-neutral-accent">
            <Text className="text-center text-xl text-neutral-contrast">
              Set {themeName === 'light' ? 'Dark' : 'Light'} Theme
            </Text>
          </Button>
        </View>
        <View className="flex flex-row items-center gap-2">
          <Text className="w-40 text-xl font-medium text-neutral-contrast">
            Workout Settings
          </Text>
          <Button
            onPress={handleDeleteWorkouts}
            className="flex-1 bg-neutral-accent"
          >
            <Text className="text-center text-xl text-neutral-contrast">
              Delete All Previous Workouts
            </Text>
          </Button>
        </View>
      </View>
    </>
  );
}

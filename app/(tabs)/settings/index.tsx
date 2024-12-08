import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeContext } from '@/store/context/themeContext';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';
import { deleteWorkouts } from '@/db/reset';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import PushOntoStackWrapper from '@/components/PushOntoStackWrapper';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import TextContrast from '@/components/ui/TextContrast';

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
      <ScreenLayoutWrapper className="gap-2">
        <View className="flex flex-row items-center gap-2">
          <TextContrast className="w-44 text-xl font-medium">
            Theme Settings
          </TextContrast>
          <MyButtonOpacity
            onPress={setTheme}
            className="flex-1 bg-neutral-accent"
          >
            <Text className="text-center text-xl text-neutral-contrast">
              Set {themeName === 'light' ? 'Dark' : 'Light'} Theme
            </Text>
          </MyButtonOpacity>
        </View>
        <View className="flex flex-row items-center gap-2">
          <TextContrast className="w-44 text-xl font-medium">
            Workout Settings
          </TextContrast>
          <MyButtonOpacity
            onPress={handleDeleteWorkouts}
            className="flex-1 bg-neutral-accent"
          >
            <Text className="text-center text-xl text-neutral-contrast">
              Delete All Previous Workouts
            </Text>
          </MyButtonOpacity>
        </View>
        {/* <View className="flex flex-row items-center gap-2">
          <TextContrast className="w-44 text-xl font-medium">
            Feedback Settings
          </TextContrast>
          <PushOntoStackWrapper href="/(tabs)/settings/feedback">
            <MyButtonOpacity className="flex-1 bg-neutral-accent">
              <Text className="text-center text-xl text-neutral-contrast">
                Send feedback
              </Text>
            </MyButtonOpacity>
          </PushOntoStackWrapper>
        </View> */}
      </ScreenLayoutWrapper>
    </>
  );
}

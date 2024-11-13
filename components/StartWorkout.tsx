import React from 'react';
import { Text, Pressable } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useRouter } from 'expo-router';

export default function StartWorkout({ inWorkout, setInWorkout }: any) {
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();

  const handleStartWorkout = () => {
    const options = ['Use template', 'No template', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0: // use template
            router.push('/(tabs)/workout/template/selectTemplate');
            // setInWorkout(true);
            break;
          case 1:
            setInWorkout(true);
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  const handleStopWorkout = () => {
    const options = ['End Workout', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            setInWorkout(false);
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  if (!inWorkout) {
    return (
      <Pressable
        className="rounded-sm bg-green-500 px-4 py-2"
        onPress={handleStartWorkout}
      >
        <Text className="text-center font-medium text-white">Start</Text>
      </Pressable>
    );
  }

  if (inWorkout) {
    return (
      <Pressable
        className="rounded-sm bg-red-500 px-4 py-2"
        onPress={handleStopWorkout}
      >
        <Text className="text-center font-medium text-white">End</Text>
      </Pressable>
    );
  }
}

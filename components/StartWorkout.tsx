import React from 'react';
import { Text, Pressable } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '@/store/workout/workoutStore';

// type StartWorkoutProps = {
//   inWorkout: boolean;
//   setInWorkout: React.Dispatch<React.SetStateAction<boolean>>;
// };

export default function StartWorkout() {
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();
  const {
    template,
    inWorkout,
    toggleWorkout,
    clearTemplate,
    upsertWorkout,
    validateWorkout,
  } = useWorkoutStore((state) => state);

  const startWorkout = () => {
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
            break;
          case 1:
            toggleWorkout();
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  const endWorkout = () => {
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
            toggleWorkout();
            // await upsertWorkout();
            // clearTemplate();
            const isValid = await validateWorkout();
            console.log('Workout is valid?:', isValid);
            console.log('Final template', template);
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
        onPress={startWorkout}
      >
        <Text className="text-center font-medium text-white">Start</Text>
      </Pressable>
    );
  }

  if (inWorkout) {
    return (
      <Pressable
        className="rounded-sm bg-red-500 px-4 py-2"
        onPress={endWorkout}
      >
        <Text className="text-center font-medium text-white">End</Text>
      </Pressable>
    );
  }
}

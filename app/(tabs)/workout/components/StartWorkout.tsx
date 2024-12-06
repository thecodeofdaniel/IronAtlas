import React from 'react';
import { Text, Pressable } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import MyButton from '@/components/ui/MyButton';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import { useThemeContext } from '@/store/context/themeContext';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';

// type StartWorkoutProps = {
//   inWorkout: boolean;
//   setInWorkout: React.Dispatch<React.SetStateAction<boolean>>;
// };

export default function StartWorkout() {
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();
  const { colors } = useThemeContext();
  const { inWorkout, toggleWorkout, upsertWorkout } = useWorkoutStore(
    (state) => state,
  );

  const startWorkout = () => {
    const options = ['Use routine', 'Without routine', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        ...getActionSheetStyle(colors),
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0: // use template
            router.push('/(tabs)/workout/routines/selectRoutine');
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
        ...getActionSheetStyle(colors),
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            await upsertWorkout();
            toggleWorkout(); // turns off the workout
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  if (!inWorkout) {
    return (
      <MyButtonOpacity
        className="rounded-sm bg-green-500 px-4 py-2"
        onPress={startWorkout}
      >
        <Text className="text-center font-medium text-white">Start</Text>
      </MyButtonOpacity>
    );
  }

  if (inWorkout) {
    return (
      <MyButtonOpacity
        className="rounded-sm bg-red-500 px-4 py-2"
        onPress={endWorkout}
      >
        <Text className="text-center font-medium text-white">End</Text>
      </MyButtonOpacity>
    );
  }
}

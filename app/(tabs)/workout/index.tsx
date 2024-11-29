import React, { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import {
  GestureHandlerRootView,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import TrackExercise from '@/components/SetsTable/SetsTable';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import StartWorkout from '@/app/(tabs)/workout/components/StartWorkout';
import StartWorkout2 from '@/app/(tabs)/workout/components/StartWorkout';
import { useModalStore } from '@/store/modalStore';
import TemplateScreen from '../../../components/TemplateOG/Template';
import OpenModalButton from '@/components/OpenModalButton';
import {
  useWorkoutStore,
  useWorkoutStoreHook,
} from '@/store/workout/workoutStore';
import PushOntoStack from '@/components/PushOntoStack';
import MyButton from '@/components/ui/MyButton';
import TextContrast from '@/components/ui/TextContrast';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';

export default function WorkoutTab() {
  // const inWorkout = useWorkoutStore((state) => state.inWorkout);
  const router = useRouter();
  const { template, inWorkout, validateWorkout } = useWorkoutStore(
    (state) => state,
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Workout',
          headerShown: true,
          headerRight: () => <StartWorkout />,
        }}
      />
      <View className="flex-1 bg-neutral p-2">
        {inWorkout && (
          <View className="flex-1">
            <TemplateScreen />
            <OpenModalButton
              activeModal="selectExercises"
              modalData={{
                isSuperset: false,
                uuid: '0',
                storeType: 'workout',
              }}
              className="border bg-stone-300 py-2"
            >
              <Text className="text-center">Add Exercises</Text>
            </OpenModalButton>
            <MyButton
              onPress={() => {
                validateWorkout();
              }}
              className="border bg-stone-300 py-2"
            >
              <Text>Validate</Text>
            </MyButton>
          </View>
        )}
        {!inWorkout && (
          <View className="flex-1">
            <View className="flex-1 items-center justify-center">
              {/* <Text>Previous Workouts</Text> */}
            </View>
            <View className="flex flex-row gap-1">
              <MyButtonOpacity
                className="flex-1 bg-red-500 py-2"
                onPress={() => {
                  router.push('/(tabs)/workout/workouts/viewWorkouts');
                }}
              >
                <Text className="text-center font-medium text-neutral-contrast">
                  View Previous Workouts
                </Text>
              </MyButtonOpacity>

              <MyButtonOpacity
                className="flex-1 bg-red-500 py-2"
                onPress={() => {
                  router.push('/(tabs)/workout/template/viewTemplates');
                }}
              >
                <Text className="text-center font-medium text-neutral-contrast">
                  View Templates
                </Text>
              </MyButtonOpacity>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

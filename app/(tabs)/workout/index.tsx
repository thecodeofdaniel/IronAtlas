import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Keyboard,
  Button,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import {
  GestureHandlerRootView,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import TrackExercise from '@/components/SetsTable/SetsTable';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import StartWorkout from '@/components/StartWorkout';
import StartWorkout2 from '@/components/StartWorkout';
import { useModalStore } from '@/store/modalStore';
import TemplateScreen from '../../../components/TemplateOG/Template';
import OpenModalButton from '@/components/OpenModalButton';
import {
  useWorkoutStore,
  useWorkoutStoreHook,
} from '@/store/workout/workoutStore';
import PushOntoStackButton from '@/components/PushOntoStackButton';

export default function WorkoutTab() {
  // const inWorkout = useWorkoutStore((state) => state.inWorkout);
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
      <View className="bg-neutral flex-1 p-2">
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
            <Pressable
              onPress={() => {
                validateWorkout();
              }}
              className="border bg-stone-300 py-2"
            >
              <Text>Validate</Text>
            </Pressable>
          </View>
        )}
        {!inWorkout && (
          <View className="flex-1 border">
            <View className="flex-1 items-center justify-center border">
              <Text>Previous Workouts</Text>
            </View>
            <View className="flex flex-row gap-1">
              <PushOntoStackButton
                href="/(tabs)/workout/workouts/viewWorkouts"
                className="flex-1 bg-red-500 py-2"
              >
                <Text className="text-center text-white">
                  View Previous Workouts
                </Text>
              </PushOntoStackButton>
              <PushOntoStackButton
                href="/(tabs)/workout/template/viewTemplates"
                className="flex-1 bg-red-500 py-2"
              >
                <Text className="text-center text-white">View Templates</Text>
              </PushOntoStackButton>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

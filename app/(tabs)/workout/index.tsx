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
      <View className="m-2 flex-1">
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
      </View>
    </>
  );
}

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
import OpenModalWrapper from '@/components/OpenModalWrapper';
import {
  useWorkoutStore,
  useWorkoutStoreHook,
} from '@/store/workout/workoutStore';
import PushOntoStack from '@/components/PushOntoStackWrapper';
import MyButton from '@/components/ui/MyButton';
import TextContrast from '@/components/ui/TextContrast';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import ViewWorkouts from './workouts/viewWorkouts';
import RenderWorkouts from './components/RenderWorkouts';
import TemplateScreen2 from '@/components/Template/Template2';

export default function WorkoutTab() {
  const router = useRouter();
  const { template, inWorkout, actions } = useWorkoutStoreHook();

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
            <GestureHandlerRootView>
              <TemplateScreen2 template={template} actions={actions} />
            </GestureHandlerRootView>
            <OpenModalWrapper
              activeModal="selectExercises"
              modalData={{
                isSuperset: false,
                uuid: '0',
                storeType: 'workout',
              }}
            >
              <MyButtonOpacity>
                <Text className="text-center font-medium text-neutral-contrast">
                  Add Exercises
                </Text>
              </MyButtonOpacity>
            </OpenModalWrapper>
            <MyButtonOpacity
              onPress={() => {
                actions.validateWorkout();
              }}
            >
              <Text className="text-center font-medium text-neutral-contrast">
                Validate
              </Text>
            </MyButtonOpacity>
          </View>
        )}
        {!inWorkout && (
          <>
            <View className="flex-1">
              <Text className="text-xl font-bold text-neutral-contrast">
                Last Five Workouts
              </Text>
              <RenderWorkouts numberOfWorkouts={5} />
            </View>
            <View className="flex flex-row gap-1">
              <MyButtonOpacity
                className="flex-1 bg-red-500 py-2"
                onPress={() => {
                  router.push('/(tabs)/workout/workouts/viewWorkouts');
                }}
              >
                <Text className="text-center font-medium text-white">
                  View Previous Workouts
                </Text>
              </MyButtonOpacity>

              <MyButtonOpacity
                className="flex-1 bg-red-500 py-2"
                onPress={() => {
                  router.push('/(tabs)/workout/template/viewTemplates');
                }}
              >
                <Text className="text-center font-medium text-white">
                  View Templates
                </Text>
              </MyButtonOpacity>
            </View>
          </>
        )}
      </View>
    </>
  );
}

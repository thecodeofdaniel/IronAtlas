import React from 'react';
import { View, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StartWorkout from '@/app/(tabs)/workout/components/StartWorkout';
import OpenModalWrapper from '@/components/OpenModalWrapper';
import { useTemplateStoreHook } from '@/store/zustand/template/templateStore';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import RenderWorkouts from './components/RenderWorkouts';
import TemplateLayout from '@/components/Template/Template';
import PushOntoStackWrapper from '@/components/PushOntoStackWrapper';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';

export default function WorkoutTab() {
  const router = useRouter();
  const { template, inWorkout, actions } = useTemplateStoreHook();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Workout',
          headerShown: true,
          headerRight: () => <StartWorkout />,
        }}
      />
      <ScreenLayoutWrapper>
        {inWorkout && (
          <View className="flex-1">
            <GestureHandlerRootView>
              <TemplateLayout template={template} actions={actions} />
            </GestureHandlerRootView>
            <OpenModalWrapper
              activeModal="selectExercises"
              modalData={{
                isSuperset: false,
                uuid: '0',
                storeType: 'workout',
              }}
            >
              <MyButtonOpacity className="py-4">
                <Text className="text-center font-medium text-neutral-contrast">
                  Add Exercises
                </Text>
              </MyButtonOpacity>
            </OpenModalWrapper>
          </View>
        )}
        {!inWorkout && (
          <>
            <View className="flex-1">
              <Text className="text-xl font-bold text-neutral-contrast">
                Previous Workouts
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

              <PushOntoStackWrapper href="/(tabs)/workout/routines/viewRoutines">
                <MyButtonOpacity className="flex-1 bg-red-500 py-2">
                  <Text className="text-center font-medium text-white">
                    View Routines
                  </Text>
                </MyButtonOpacity>
              </PushOntoStackWrapper>
            </View>
          </>
        )}
      </ScreenLayoutWrapper>
    </>
  );
}

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
import TemplateScreen from './Template';
import OpenModalButton from '@/components/OpenModalButton';

export default function WorkoutTab() {
  const [inWorkout, setInWorkout] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Workout',
          headerShown: true,
          headerRight: () => (
            <StartWorkout inWorkout={inWorkout} setInWorkout={setInWorkout} />
          ),
        }}
      />
      <View className="m-2 flex flex-1 justify-between">
        <TemplateScreen />
        {inWorkout && (
          <View className="flex flex-row gap-2">
            {/* <Pressable
              onPress={() => {
                openModal('selectExercises', {
                  isSuperset: false,
                  uuid: '0',
                  storeType: 'workout',
                });
                router.push('/modal');
              }}
              className="flex-1 border bg-stone-300 py-2"
            >
              <Text className="text-center">Add exercises</Text>
            </Pressable> */}
            <OpenModalButton
              activeModal="selectExercises"
              modalData={{
                isSuperset: false,
                uuid: '0',
                storeType: 'workout',
              }}
              className="flex-1 border bg-stone-300 py-2"
            >
              <Text className="text-center">Add Exercises</Text>
            </OpenModalButton>
          </View>
        )}
      </View>
    </>
  );
}

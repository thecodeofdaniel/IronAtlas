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

export default function WorkoutTab() {
  const [inWorkout, setInWorkout] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const openModal = useModalStore((state) => state.openModal);
  const router = useRouter();

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
        <View className="flex flex-row gap-2">
          <Pressable
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
          </Pressable>
        </View>
      </View>
    </>
  );
}

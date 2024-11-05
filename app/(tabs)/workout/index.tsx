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
import StartWorkout2 from '@/components/StartWorkout2';
import { useModalStore } from '@/store/modalStore';

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
            <StartWorkout2 inWorkout={inWorkout} setInWorkout={setInWorkout} />
          ),
        }}
      />
      {/* <GestureHandlerRootView>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
          style={{ backgroundColor: 'green', height: '100%' }}
        > */}
      <View className="m-2 flex flex-1 justify-between">
        <View>
          <Text>Workout tab</Text>
        </View>
        <View className="flex flex-row gap-2">
          <Pressable
            onPress={() => {
              openModal('selectExercises', {
                selectedTags,
                setSelectedTags,
              });
              router.push('/modal');
            }}
            className="flex-1 border bg-stone-300 py-2"
          >
            <Text className="text-center">Add exercises</Text>
          </Pressable>
        </View>
      </View>
      {/* </TouchableWithoutFeedback>
      </GestureHandlerRootView> */}

      {/* sets table */}
      {/* <GestureHandlerRootView style={{ margin: 4, flex: 1 }}>
        <TrackExercise />
      </GestureHandlerRootView> */}
    </>
  );
}

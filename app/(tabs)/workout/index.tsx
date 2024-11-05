import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Keyboard,
  Button,
} from 'react-native';
import { Link, Stack } from 'expo-router';
import {
  GestureHandlerRootView,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import TrackExercise from '@/components/SetsTable/SetsTable';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import StartWorkout from '@/components/StartWorkout';
import StartWorkout2 from '@/components/StartWorkout2';

export default function WorkoutTab() {
  const popoverRef = useRef();
  const [inWorkout, setInWorkout] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Workout',
          headerShown: true,
          headerRight: () => (
            // <StartWorkout
            //   ref={popoverRef}
            //   inWorkout={inWorkout}
            //   setInWorkout={setInWorkout}
            //   showPopover={showPopover}
            //   setShowPopover={setShowPopover}
            // />
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
          <Link
            href={{
              pathname: '/(tabs)/workout/template',
            }}
            className="flex-1 border bg-stone-300"
          >
            <Text className="text-center">Add template</Text>
          </Link>
          <Pressable className="flex-1 border bg-stone-300">
            <Text className="text-center">Use template</Text>
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

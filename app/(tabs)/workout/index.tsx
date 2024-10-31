import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Keyboard,
} from 'react-native';
import { Link, Stack } from 'expo-router';
import TrackExercise from './trackExercise';
import {
  GestureHandlerRootView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';

export default function WorkoutTab() {
  return (
    <>
      <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
      {/* <View className="border flex-1 justify-between m-2"> */}
      <GestureHandlerRootView>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
          style={{ backgroundColor: 'green', height: '100%' }}
        >
          <View className="flex flex-1 justify-between m-2">
            <View>
              <Text>Workout tab</Text>
              <TrackExercise />
            </View>
            <View className="flex flex-row gap-2">
              <Link
                href={{
                  pathname: '/(tabs)/workout/template',
                }}
                className="border bg-stone-300 flex-1"
              >
                <Text className="text-center">Add template</Text>
              </Link>
              <Pressable className="border flex-1 bg-stone-300">
                <Text className="text-center">Use template</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </>
  );
}

import {
  useTemplateStore,
  useTemplateStoreHook,
} from '@/store/template/templateStore';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import TemplateScreen2 from '../../../../components/Template/Template2';
import { useModalStore } from '@/store/modalStore';
import { useExerciseSelectionHook } from '@/store/exerciseSelection/exerciseSelectionHook';
import { useWorkoutStoreHook } from '@/store/workout/workoutStore';
import TemplateScreen from '../Template';
import {
  GestureHandlerRootView,
  TextInput,
} from 'react-native-gesture-handler';

export default function CreateTemplate() {
  const router = useRouter();
  const { template, actions } = useWorkoutStoreHook();
  const openModal = useModalStore((state) => state.openModal);

  console.log('Template', template);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Template',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable
              className="rounded-md bg-green-500 px-4 py-2"
              onPress={() => {
                openModal('saveTemplate');
                router.push('/modal');
              }}
            >
              <Text className="font-semibold text-white">Save</Text>
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 p-2">
        <TouchableWithoutFeedback
          onPress={() => Keyboard.dismiss()}
          accessible={false}
        >
          <GestureHandlerRootView style={{ flex: 1, gap: 4 }}>
            <View className="flex flex-col">
              <Text className="text-lg font-medium">Template Name</Text>
              <TextInput className="border px-1 py-2" />
              <Text className="text-lg font-medium">Template Details</Text>
              <TextInput
                className="border px-1 py-2"
                multiline={true}
                numberOfLines={2}
                textAlignVertical="top" // This helps on Android
                placeholder="Enter template description..."
                style={{ minHeight: 50 }} // Optional: ensures minimum height
                maxLength={100}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
            <Text className="text-lg font-medium">Exercises</Text>
            <View className="flex-1 border">
              <TemplateScreen2 template={template} actions={actions} />
            </View>
          </GestureHandlerRootView>
        </TouchableWithoutFeedback>
        <Pressable
          className="bg-blue-500 p-4"
          onPress={() => {
            openModal('selectExercises', {
              isSuperset: false,
              uuid: '0',
              storeType: 'workout',
            });
            router.push('/modal');
          }}
        >
          <Text className="text-center text-white">Pick Exercise</Text>
        </Pressable>
      </View>
    </>
  );
}

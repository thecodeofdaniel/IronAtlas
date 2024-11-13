import {
  useTemplateStore,
  useTemplateStoreHook,
} from '@/store/template/templateStore';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import TemplateScreen2 from '../../../../components/Template/Template2';
import { useModalStore } from '@/store/modalStore';
import { useExerciseSelectionHook } from '@/store/exerciseSelection/exerciseSelectionHook';
import { useWorkoutStoreHook } from '@/store/workout/workoutStore';
import TemplateScreen from '../Template';

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
            <Pressable>
              <Text>Save</Text>
            </Pressable>
          ),
        }}
      />
      {/* <View className="flex-1 items-center justify-center">
        <Text>createTemplate</Text>
      </View> */}
      <TemplateScreen2 template={template} actions={actions} />
      {/* <TemplateScreen /> */}
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
    </>
  );
}

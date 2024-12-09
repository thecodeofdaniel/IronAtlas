import React from 'react';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTemplateStoreHook } from '@/store/zustand/template/templateStore';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import TemplateLayout from '@/components/Template/Template';
import MySimpleButton from '@/components/ui/MySimpleButton';
import OpenModalWrapper from '@/components/OpenModalWrapper';

export default function UpdateWorkout() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const router = useRouter();
  const { template, actions } = useTemplateStoreHook();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Update Workout',
          headerRight: () => (
            <MySimpleButton
              title="Update"
              className="bg-green-500"
              onPress={() => {
                actions.upsertWorkout(+workoutId);
                router.back();
              }}
            />
          ),
        }}
      />
      <ScreenLayoutWrapper>
        <Text className="mb-1 text-lg font-medium text-neutral-contrast">
          Exercises
        </Text>
        <GestureHandlerRootView>
          <TemplateLayout template={template} actions={actions} />
        </GestureHandlerRootView>
        <OpenModalWrapper
          activeModal="selectExercises"
          modalData={{ isSuperset: false, uuid: '0', storeType: 'template' }}
        >
          <MySimpleButton title="Add Exercises" />
        </OpenModalWrapper>
      </ScreenLayoutWrapper>
    </>
  );
}

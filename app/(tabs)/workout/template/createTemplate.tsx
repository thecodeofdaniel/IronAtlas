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
  Button,
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
import { Controller, useForm } from 'react-hook-form';

export default function CreateTemplate() {
  const router = useRouter();
  const { template, actions } = useWorkoutStoreHook();
  const openModal = useModalStore((state) => state.openModal);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      templateName: '',
      templateInfo: '',
    },
  });

  const onSubmit = (data: any) => console.log(data);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Template',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable
              className="rounded-md bg-green-500 px-4 py-2"
              onPress={handleSubmit(onSubmit)}
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
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <Text className="text-lg font-medium">Template Name</Text>
                    <TextInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="border px-1 py-2"
                    />
                  </>
                )}
                name="templateName"
              />
              {errors.templateName && (
                <Text className="text-red-500">This is required.</Text>
              )}
              <Controller
                control={control}
                rules={{
                  required: false,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <Text className="text-lg font-medium">
                      Template Details
                    </Text>
                    <TextInput
                      className="border px-1 py-2"
                      style={{ minHeight: 50 }} // Optional: ensures minimum height
                      multiline={true}
                      numberOfLines={2}
                      textAlignVertical="top" // This helps on Android
                      maxLength={100}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  </>
                )}
                name="templateInfo"
              />
              {errors.templateInfo && (
                <Text className="text-red-500">This is required.</Text>
              )}
            </View>
            <Text className="text-lg font-medium">Exercises</Text>
            <View className="flex-1 border">
              <TemplateScreen2 template={template} actions={actions} />
            </View>
            <Text>Select at least one exercise or superset</Text>
          </GestureHandlerRootView>
        </TouchableWithoutFeedback>
        <Pressable
          className="mt-2 bg-blue-500 p-4"
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

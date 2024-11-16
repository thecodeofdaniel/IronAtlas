import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { useWorkoutStoreHook } from '@/store/workout/workoutStore';
import {
  GestureHandlerRootView,
  TextInput,
} from 'react-native-gesture-handler';
import { eq } from 'drizzle-orm';
import { db } from '@/db/instance';
import * as templateSchema from '@/db/schema/template';

const emptyErrorMsgs = {
  templateName: '',
  exercises: '',
};

export default function CreateTemplate2() {
  const { templateWorkoutId } = useLocalSearchParams<{
    templateWorkoutId?: string;
  }>();

  console.log('TemplateWorkoutId:', templateWorkoutId);

  const router = useRouter();
  const { template, actions } = useWorkoutStoreHook();
  const openModal = useModalStore((state) => state.openModal);

  // Move the template loading to useEffect
  React.useEffect(() => {
    if (templateWorkoutId !== undefined) {
      actions.loadTemplate(+templateWorkoutId);
    }
  }, [templateWorkoutId]); // Only run when templateWorkoutId changes

  const [templateName, setTemplateName] = useState(() => {
    if (!templateWorkoutId) {
      return '';
    } else {
      const [workout] = db
        .select({ name: templateSchema.workoutTemplate.name })
        .from(templateSchema.workoutTemplate)
        .where(eq(templateSchema.workoutTemplate.id, +templateWorkoutId))
        .all();

      return workout.name;
    }
  });

  const [templateInfo, setTemplateInfo] = useState('');
  const [errorMsgs, setErrorMsgs] = useState(emptyErrorMsgs);

  const onSubmit = async () => {
    // Reset messages
    setErrorMsgs(emptyErrorMsgs);

    let hasError = false;

    // Template must have a name
    if (templateName === '') {
      setErrorMsgs((prev) => ({
        ...prev,
        templateName: 'Must include a name',
      }));
      hasError = true;
    }

    // A template must include at least one exercise
    if (template[0].children.length === 0) {
      setErrorMsgs((prev) => ({
        ...prev,
        exercises: 'Must include one exercise',
      }));
      hasError = true;
    }

    // A superset cannot be empty
    template[0].children.forEach((exerciseUUID) => {
      if (
        template[exerciseUUID].exerciseId === null &&
        template[exerciseUUID].children.length === 0
      ) {
        setErrorMsgs((prev) => ({
          ...prev,
          exercises: 'A superset cannot be empty',
        }));
        hasError = true;
      }
    });

    if (hasError) {
      console.log('Form for creating template, has an error');
      return;
    }

    await actions.saveAsTemplate(templateName);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: templateWorkoutId ? 'Edit Template' : 'Create Template',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable
              className="rounded-md bg-green-500 px-4 py-2"
              onPress={onSubmit}
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
              {/* Template Name */}
              <View>
                <Text className="text-lg font-medium">Template Name</Text>
                <TextInput
                  onChangeText={(text) => setTemplateName(text)}
                  value={templateName}
                  className="border px-2 py-1"
                />
                {errorMsgs.templateName && (
                  <Text className="text-red-500">
                    Add a name to this template
                  </Text>
                )}
              </View>
              {/* Template Info */}
              <View>
                <Text className="text-lg font-medium">Template Details</Text>
                <TextInput
                  className="border px-2 py-2"
                  style={{ minHeight: 50 }} // Optional: ensures minimum height
                  multiline={true}
                  numberOfLines={2}
                  textAlignVertical="top" // This helps on Android
                  maxLength={100}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(text) => setTemplateInfo(text)}
                  value={templateInfo}
                />
              </View>
            </View>
            {/* Exercises */}
            <View className="flex-1">
              <Text className="text-lg font-medium">Exercises</Text>
              <TemplateScreen2
                template={template}
                actions={actions}
                className="flex-1 border"
              />
              {errorMsgs.exercises && (
                <Text className="text-red-500">{errorMsgs.exercises}</Text>
              )}
            </View>
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

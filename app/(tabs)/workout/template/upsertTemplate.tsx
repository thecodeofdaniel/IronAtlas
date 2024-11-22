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
import { db } from '@/db/instance';
import { eq } from 'drizzle-orm';
import * as sch from '@/db/schema/template';
import OpenModalButton from '@/components/OpenModalButton';

const emptyErrorMsgs = {
  templateName: '',
  exercises: '',
};

export default function UpsertTemplate() {
  // console.log('Render upsertTemplate');

  const { templateWorkoutId, templateWorkoutName } = useLocalSearchParams<{
    templateWorkoutId?: string;
    templateWorkoutName?: string;
  }>();

  const router = useRouter();
  const { template, actions } = useWorkoutStoreHook();

  const [templateName, setTemplateName] = useState(templateWorkoutName ?? '');
  const [errorMsgs, setErrorMsgs] = useState(emptyErrorMsgs);

  const onSubmit = async () => {
    // Reset messages
    setErrorMsgs(emptyErrorMsgs);

    let hasError = false;

    // Template must have a name
    if (templateName === '') {
      setErrorMsgs((prev) => ({
        ...prev,
        templateName: 'Add a name to this template :)',
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

    // If inserting or updating template with a different name
    if (templateName === undefined || templateWorkoutName !== templateName) {
      const nameExists = db
        .select({ id: sch.workoutTemplate.id })
        .from(sch.workoutTemplate)
        .where(eq(sch.workoutTemplate.name, templateName))
        .get();

      if (nameExists) {
        setErrorMsgs((prev) => ({
          ...prev,
          templateName: `A template with the \"${templateName}\" already exists`,
        }));
        hasError = true;
      }
    }

    // Stop if form has errors
    if (hasError) return;

    actions.upsertTemplate(
      templateName.trim(),
      templateWorkoutId ? +templateWorkoutId : undefined,
    );

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
            {/* Template Name */}
            <View>
              <Text className="text-lg font-medium">Template Name</Text>
              <TextInput
                onChangeText={(text) => setTemplateName(text)}
                value={templateName}
                className="border px-2 py-1"
              />
              {errorMsgs.templateName && (
                <Text className="text-red-500">{errorMsgs.templateName}</Text>
              )}
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
        <OpenModalButton
          activeModal="selectExercises"
          modalData={{
            isSuperset: false,
            uuid: '0',
            storeType: 'workout',
          }}
          className="mt-2 bg-blue-500 p-4"
        >
          <Text className="text-center text-white">Pick Exercise</Text>
        </OpenModalButton>
      </View>
    </>
  );
}

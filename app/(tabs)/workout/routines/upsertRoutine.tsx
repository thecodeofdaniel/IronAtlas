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
import { useModalStore } from '@/store/zustand/modal/modalStore';
import { useWorkoutStoreHook } from '@/store/zustand/template/templateStore';
import {
  GestureHandlerRootView,
  TextInput,
} from 'react-native-gesture-handler';
import { db } from '@/db/instance';
import { eq } from 'drizzle-orm';
import * as sch from '@/db/schema/routine';
import OpenModalWrapper from '@/components/OpenModalWrapper';
import TextContrast from '@/components/ui/TextContrast';
import MyButton from '@/components/ui/MyButton';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';

const emptyErrorMsgs = {
  templateName: '',
  exercises: '',
};

export default function UpsertRoutine() {
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
        .select({ id: sch.routine.id })
        .from(sch.routine)
        .where(eq(sch.routine.name, templateName))
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

    actions.upsertRoutine(
      templateName.trim(),
      templateWorkoutId ? +templateWorkoutId : undefined,
    );

    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${templateWorkoutId ? 'Edit' : 'Create'} Routine`,
          headerBackTitle: 'Back',
          headerRight: () => (
            <MyButtonOpacity onPress={onSubmit}>
              <Text className="font-semibold text-white">
                {templateWorkoutId ? 'Update' : 'Add'}
              </Text>
            </MyButtonOpacity>
          ),
        }}
      />
      <ScreenLayoutWrapper>
        <TouchableWithoutFeedback
          onPress={() => Keyboard.dismiss()}
          accessible={false}
        >
          <GestureHandlerRootView style={{ flex: 1, gap: 4 }}>
            {/* Routine Name */}
            <View>
              <TextContrast className="text-lg font-medium">
                Routine Name
              </TextContrast>
              <TextInput
                onChangeText={(text) => setTemplateName(text)}
                value={templateName}
                className="border-2 border-neutral-accent px-2 py-1 text-neutral-contrast"
              />
              {errorMsgs.templateName && (
                <Text className="text-red-500">{errorMsgs.templateName}</Text>
              )}
            </View>
            {/* Exercises */}
            <View className="flex-1">
              <TextContrast className="text-lg font-medium">
                Exercises
              </TextContrast>
              <TemplateScreen2
                template={template}
                actions={actions}
                className="flex-1 border-2 border-neutral-accent p-1"
              />
              {errorMsgs.exercises && (
                <Text className="text-red-500">{errorMsgs.exercises}</Text>
              )}
            </View>
          </GestureHandlerRootView>
        </TouchableWithoutFeedback>
        <OpenModalWrapper
          activeModal="selectExercises"
          modalData={{
            isSuperset: false,
            uuid: '0',
            storeType: 'workout',
          }}
        >
          <MyButtonOpacity className="mt-2">
            <Text className="text-center text-lg font-medium text-white">
              Pick Exercise
            </Text>
          </MyButtonOpacity>
        </OpenModalWrapper>
      </ScreenLayoutWrapper>
    </>
  );
}

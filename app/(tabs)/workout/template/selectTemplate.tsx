import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import RenderTemplates from '@/components/RenderTemplates';

export default function SelectTemplate() {
  const [selected, setSelected] = useState<number>();

  const router = useRouter();
  const { clearTemplate, loadTemplate, toggleWorkout } = useWorkoutStore(
    (state) => state,
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Select Template' }} />
      <View className="flex-1 p-2">
        <RenderTemplates selected={selected} setSelected={setSelected} />
      </View>
      <View className="flex flex-row justify-between gap-2 p-2">
        <Pressable
          disabled={selected === undefined}
          className="flex-1 bg-green-500 p-4"
          onPress={() => {
            if (selected === undefined) return;

            loadTemplate(selected);
            router.back();
            toggleWorkout();
          }}
          style={{ opacity: selected === undefined ? 0.3 : 1 }}
        >
          <Text className="text-center">Pick Template</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-blue-500 p-4"
          onPress={() => {
            clearTemplate();
            router.push('/workout/template/upsertTemplate');
          }}
        >
          <Text className="text-center">Create Template</Text>
        </Pressable>
      </View>
    </>
  );
}

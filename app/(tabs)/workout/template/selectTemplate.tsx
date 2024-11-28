import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import RenderTemplates from '@/app/(tabs)/workout/components/RenderTemplates';
import MyButton from '@/components/ui/MyButton';
import { cn } from '@/lib/utils';

export default function SelectTemplate() {
  const [selected, setSelected] = useState<number>();
  const isUnselected = selected === undefined;

  const router = useRouter();
  const { clearTemplate, loadTemplate, toggleWorkout } = useWorkoutStore(
    (state) => state,
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Select Template' }} />
      <View className="flex-1 bg-neutral">
        <View className="flex-1 p-2">
          <RenderTemplates selected={selected} setSelected={setSelected} />
        </View>
        <View className="flex flex-row justify-between gap-2 p-2">
          <MyButton
            disabled={isUnselected}
            className={cn('flex-1 bg-green-500 p-4 transition-all', {
              'bg-green-500/40': isUnselected,
            })}
            onPress={() => {
              if (isUnselected) return;

              loadTemplate(selected);
              router.back();
              toggleWorkout();
            }}
          >
            <Text
              className={cn('text-center font-medium text-neutral-contrast', {
                'text-neutral-contrast/40': isUnselected,
              })}
            >
              Pick Template
            </Text>
          </MyButton>
          <MyButton
            className="flex-1 bg-blue-500 p-4"
            onPress={() => {
              clearTemplate();
              router.push('/workout/template/upsertTemplate');
            }}
          >
            <Text className="text-center font-medium text-neutral-contrast">
              Create Template
            </Text>
          </MyButton>
        </View>
      </View>
    </>
  );
}

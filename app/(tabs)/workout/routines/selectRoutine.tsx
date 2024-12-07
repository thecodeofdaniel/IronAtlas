import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTemplateStore } from '@/store/zustand/template/templateStore';
import RenderRoutines from '@/app/(tabs)/workout/components/RenderRoutines';
import MyButton from '@/components/ui/MyButton';
import { cn } from '@/lib/utils';

export default function SelectRoutine() {
  const [selected, setSelected] = useState<number>();
  const isUnselected = selected === undefined;

  const router = useRouter();
  const { clearTemplate, loadRoutine, toggleWorkout } = useTemplateStore(
    (state) => state,
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Select Routine' }} />
      <View className="flex-1 bg-neutral">
        <View className="flex-1 p-2">
          <RenderRoutines selected={selected} setSelected={setSelected} />
        </View>
        <View className="flex flex-row justify-between gap-2 p-2">
          <MyButton
            disabled={isUnselected}
            className={cn('flex-1 bg-green-500 p-4 transition-all', {
              'bg-green-500/40': isUnselected,
            })}
            onPress={() => {
              if (isUnselected) return;

              loadRoutine(selected);
              router.back();
              toggleWorkout();
            }}
          >
            <Text
              className={cn('text-center font-medium text-neutral-contrast', {
                'text-neutral-contrast/40': isUnselected,
              })}
            >
              Pick Routine
            </Text>
          </MyButton>
          <MyButton
            className="flex-1 bg-blue-500 p-4"
            onPress={() => {
              clearTemplate();
              router.push('/(tabs)/workout/routines/upsertRoutine');
            }}
          >
            <Text className="text-center font-medium text-neutral-contrast">
              Create Routine
            </Text>
          </MyButton>
        </View>
      </View>
    </>
  );
}

import React from 'react';
import { Pressable, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import RenderTemplates from '../components/RenderRoutines';
import { Ionicons } from '@expo/vector-icons';
import { useTemplateStore } from '@/store/zustand/template/templateStore';
import { useThemeContext } from '@/store/context/themeContext';
import PushOntoStackWrapper from '@/components/PushOntoStackWrapper';

export default function ViewRoutines() {
  const clearTemplate = useTemplateStore((state) => state.clearTemplate);
  const { colors } = useThemeContext();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Routines',
          headerRight: () => (
            <PushOntoStackWrapper href="/workout/routines/upsertRoutine">
              <TouchableOpacity onPress={clearTemplate}>
                <Ionicons
                  name="add"
                  size={24}
                  color={colors['--neutral-contrast']}
                />
              </TouchableOpacity>
            </PushOntoStackWrapper>
          ),
        }}
      />
      <View className="flex-1 bg-neutral p-2">
        <RenderTemplates />
      </View>
    </>
  );
}

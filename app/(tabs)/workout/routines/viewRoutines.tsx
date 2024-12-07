import React from 'react';
import { Pressable, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import RenderRoutines from '../components/RenderRoutines';
import { Ionicons } from '@expo/vector-icons';
import { useTemplateStore } from '@/store/zustand/template/templateStore';
import { useThemeContext } from '@/store/context/themeContext';
import PushOntoStackWrapper from '@/components/PushOntoStackWrapper';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';

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
      <ScreenLayoutWrapper>
        <RenderRoutines />
      </ScreenLayoutWrapper>
    </>
  );
}

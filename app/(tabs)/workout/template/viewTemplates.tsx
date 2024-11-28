import React from 'react';
import { Pressable, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import RenderTemplates from '../components/RenderTemplates';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { useThemeContext } from '@/store/context/themeContext';

export default function ViewTemplates() {
  console.log('Render ViewTemplates');
  const router = useRouter();
  const clearTemplate = useWorkoutStore((state) => state.clearTemplate);
  const { colors } = useThemeContext();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Templates',
          headerRight: () => (
            <Pressable
              onPress={() => {
                clearTemplate();
                router.push('/workout/template/upsertTemplate');
              }}
            >
              <Ionicons
                name="add"
                size={24}
                color={colors['--neutral-contrast']}
              />
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 bg-neutral p-2">
        <RenderTemplates />
      </View>
    </>
  );
}

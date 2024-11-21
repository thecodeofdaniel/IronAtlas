import React from 'react';
import { Pressable, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import RenderTemplates from '../../../../components/RenderTemplates';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/store/workout/workoutStore';

export default function ViewTemplates() {
  const router = useRouter();
  const clearTemplate = useWorkoutStore((state) => state.clearTemplate);

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
              <Ionicons name="add" size={24} />
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 p-2">
        <RenderTemplates />
      </View>
    </>
  );
}

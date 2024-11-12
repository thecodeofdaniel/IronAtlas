import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function SelectTemplate() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Select Template' }} />
      <View className="flex-1 items-center justify-center border">
        <Text>Select a template</Text>
      </View>
      <View className="flex flex-row justify-between">
        <Pressable
          className="flex-1 bg-green-500 p-4"
          onPress={() => router.back()}
        >
          <Text className="text-center">Pick Template</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-blue-500 p-4"
          onPress={() => router.push('/workout/createTemplate')}
        >
          <Text className="text-center">Create Template</Text>
        </Pressable>
      </View>
    </>
  );
}

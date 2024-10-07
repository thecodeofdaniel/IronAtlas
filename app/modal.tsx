import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useExerciseTreeStoreWithSetter } from '@/store/exerciseTreeStore';

export default function Modal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exerciseMap } = useExerciseTreeStoreWithSetter();
  const router = useRouter();
  const ogName = exerciseMap[+id].title;

  // Prefill the input with the existing exercise name
  const [name, setName] = useState(ogName);

  // Handle the update button press
  const handleUpdate = () => {
    if (!name) return;

    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (name.trim()) {
      // updateExerciseName(+id, name); // Update the exercise name in the store
      router.back(); // Navigate back after update
    }
  };

  // Handle the cancel button press
  const handleCancel = () => {
    router.back(); // Navigate back without updating
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Edit' }} />
      <View className="flex-1 p-4">
        <Text className="text-xl mb-2">Edit Exercise Name</Text>
        <TextInput
          className="h-10 border px-2 border-gray-400"
          value={name}
          onChangeText={setName}
          placeholder="Enter exercise name"
        />
        <View className="flex-row justify-between mt-4">
          <Button title="Cancel" onPress={handleCancel} color="red" />
          <Button
            title="Update"
            onPress={handleUpdate}
            disabled={name === ogName || name.length === 0}
          />
        </View>
      </View>
    </>
  );
}

// Add exercise

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exerciseStore';

type Props = {
  modalData: ModalData['createExercise'];
  closeModal: () => void;
};

export default function CreateExercise({ modalData, closeModal }: Props) {
  const createExercise = useExerciseStore((state) => state.createExercise);
  const [name, setName] = useState('');
  const router = useRouter();

  const addExercise = () => {
    if (!name || name === '') {
      return;
    }

    const newExercise = {
      id: Date.now(),
      title: name,
    };

    createExercise(newExercise);

    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Add' }} />
      <View className="flex-1 p-4">
        <Text className="text-xl mb-2">Exercise Name</Text>
        <TextInput
          className="h-10 border px-2 border-gray-400"
          value={name}
          onChangeText={setName}
          placeholder="Enter exercise name"
        />
        <View className="flex-row justify-between mt-4">
          <Button
            title="Cancel"
            onPress={() => {
              closeModal();
              router.back();
            }}
            color="red"
          />
          <Button
            title="Create"
            onPress={addExercise}
            disabled={name.trim() === ''}
          />
        </View>
      </View>
    </>
  );
}

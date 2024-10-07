import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useExerciseTreeStoreWithSetter } from '@/store/exerciseTreeStore';
import { ModalData } from '@/store/modalStore';

type Props = {
  modalData: ModalData['editExerciseOrMuscle'];
  closeModal: () => void;
};

export default function EditExerciseOrMuscleModal({
  modalData,
  closeModal,
}: Props) {
  const router = useRouter();

  const id = modalData.id;
  const { exerciseMap, setter } = useExerciseTreeStoreWithSetter();
  const ogName = exerciseMap[id].title;

  // Prefill the input with the existing exercise name
  const [name, setName] = useState(ogName);

  // Handle the update button press
  const handleUpdate = () => {
    if (!name) return;

    const trimmedName = name.trim();
    if (trimmedName === '' || !trimmedName) return;

    setter.editTitle(id, trimmedName);
    closeModal();
    router.back(); // Navigate back after update
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

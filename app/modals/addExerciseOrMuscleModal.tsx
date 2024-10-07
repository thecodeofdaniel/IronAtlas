import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseTreeStoreWithSetter } from '@/store/exerciseTreeStore';

type Props = {
  modalData: ModalData['addExerciseOrMuscle'];
  closeModal: () => void;
};

export default function AddExerciseOrMuscleModal({
  modalData,
  closeModal,
}: Props) {
  const router = useRouter();
  const { exerciseMap, setter } = useExerciseTreeStoreWithSetter();
  const [name, setName] = useState('');

  const pressedId = modalData.pressedId;

  const handleCancel = () => {
    closeModal();
    router.back();
  };

  const handleUpdate = () => {
    setter.createChild(pressedId);
    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Add' }} />
      <View className="flex-1 p-4">
        <Text className="text-xl mb-2">Add Exercise or Muscle Category</Text>
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
            disabled={name.trim() === ''}
          />
        </View>
      </View>
    </>
  );
}

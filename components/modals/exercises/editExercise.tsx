import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exerciseStore';
import { formatTagOrExercise } from '@/utils/utils';

type Props = {
  modalData: ModalData['editExercise'];
  closeModal: () => void;
};

export default function EditExercise({ modalData, closeModal }: Props) {
  const id = modalData.id;
  const { exerciseMap, updateExercise } = useExerciseStore((state) => state);
  const [newExercise, setNewExercise] = useState(exerciseMap[id]);
  const router = useRouter();

  const addExercise = () => {
    if (!newExercise) return;

    const newLabel = newExercise.label.trim();

    if (newLabel === '') {
      console.log('Empty string');
      return;
    }

    if (newLabel === exerciseMap[id].label) {
      console.log('same label as before');
      return;
    }

    updateExercise(id, {
      ...newExercise,
      label: newLabel,
      value: formatTagOrExercise(newLabel),
    });
    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{ headerTitle: 'Edit Exercise', headerBackTitle: 'Exercises' }}
      />
      <View className="flex-1 p-4">
        <Text className="text-xl mb-2">Exercise Name</Text>
        <TextInput
          className="h-10 border px-2 border-gray-400"
          value={newExercise?.label}
          onChangeText={(text) =>
            setNewExercise((prev) => {
              return {
                ...prev,
                label: text,
              };
            })
          }
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
          <Button title="Create" onPress={addExercise} />
        </View>
      </View>
    </>
  );
}

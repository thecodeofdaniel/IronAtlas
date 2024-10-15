import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exerciseStore';
import { useTagTreeStoreWithSetter } from '@/store/tagTreeStore';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';
import TagTree from './common/tagTree';

type Props = {
  modalData: ModalData['createExercise'];
  closeModal: () => void;
};

export default function CreateExerciseModal({ modalData, closeModal }: Props) {
  const router = useRouter();
  const createExercise = useExerciseStore((state) => state.createExercise);
  const { tagMap, setter } = useTagTreeStoreWithSetter();
  const [label, setName] = useState('');
  const [selected, setSelected] = useState<{
    chosen: number[];
    preSelected: Set<number>;
  }>({
    chosen: [],
    preSelected: new Set(),
  });

  console.log(selected);

  const addExercise = () => {
    if (!label) return;

    const trimmedName = label.trim();

    if (!isValidTagOrExercise(trimmedName)) return;

    const newExercise: Exercise = {
      id: Date.now(),
      label: trimmedName,
      value: formatTagOrExercise(trimmedName),
      order: 0, // since new exercise will be at the top
      tags: new Set(selected.chosen),
    };

    console.log(newExercise);

    createExercise(newExercise);

    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Add',
          headerBackTitle: 'Exercises',
          headerRight: () => (
            <TouchableOpacity
              onPress={addExercise}
              disabled={label.trim() === ''}
              className="px-4 py-2 rounded-md bg-blue-500"
            >
              <Text className="text-white">Create</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 p-2 gap-4">
        <View>
          <Text className="text-xl">Exercise Name</Text>
          <TextInput
            className="h-10 border px-2 border-gray-400"
            value={label}
            onChangeText={setName}
            placeholder="Enter exercise name"
          />
        </View>
        <View>
          <Text className="text-xl">Select body section tags</Text>
          <TagTree
            tagMap={tagMap}
            tagChildren={[0]}
            level={0}
            selected={selected}
            setSelected={setSelected}
          />
        </View>
      </View>
    </>
  );
}

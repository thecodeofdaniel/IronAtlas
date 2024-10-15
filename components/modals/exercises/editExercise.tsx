import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exerciseStore';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';
import { useTagTreeStoreWithSetter } from '@/store/tagTreeStore';
import TagTree from './common/tagTree';
import { getAllParentIds } from './utils/utils';

type Props = {
  modalData: ModalData['editExercise'];
  closeModal: () => void;
};

export default function EditExercise({ modalData, closeModal }: Props) {
  console.log('Render edit exercise');
  const router = useRouter();
  const id = modalData.id;
  const { exerciseMap, updateExercise } = useExerciseStore((state) => state);
  const { tagMap } = useTagTreeStoreWithSetter();
  const [label, setLabel] = useState(exerciseMap[id].label);
  const [selected, setSelected] = useState<{
    chosen: number[];
    preSelected: Set<number>;
  }>(() => {
    const chosenTags = [...exerciseMap[id].tags];
    const preSelected = new Set(
      chosenTags.flatMap((tag) => getAllParentIds(tagMap, tag))
    );

    return {
      chosen: chosenTags,
      preSelected: preSelected,
    };
  });

  console.log(selected.chosen);
  console.log(selected.preSelected);

  const addExercise = () => {
    if (!label) return;

    const trimmedLabel = label.trim();

    // if (trimmedLabel === exerciseMap[id].label) {
    //   console.log('same label as before');
    //   return;
    // }

    if (!isValidTagOrExercise(trimmedLabel)) return;

    updateExercise(id, {
      ...exerciseMap[id],
      label: trimmedLabel,
      value: formatTagOrExercise(trimmedLabel),
      tags: new Set(selected.chosen),
    });

    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Edit',
          headerBackTitle: 'Exercises',
          headerRight: () => (
            <TouchableOpacity
              onPress={addExercise}
              disabled={label.trim() === ''}
              className="px-4 py-2 rounded-md bg-blue-500"
            >
              <Text className="text-white">Update</Text>
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
            onChangeText={setLabel}
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

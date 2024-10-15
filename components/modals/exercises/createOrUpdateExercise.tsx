import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStoreWithSetter } from '@/store/exerciseStore';
import { useTagTreeStoreWithSetter } from '@/store/tagTreeStore';
import { getAllParentIds } from './utils/utils';
import TagTree from './common/tagTree';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';

type CreateOrUpdateExerciseProps = {
  modalData: ModalData['createOrUpdateExercise'];
  closeModal: () => void;
};

export default function CreateOrUpdateExercise({
  modalData,
  closeModal,
}: CreateOrUpdateExerciseProps) {
  const router = useRouter();
  const id = modalData.id;
  const { exerciseMap, setter: exerciseSetter } = useExerciseStoreWithSetter();
  const { tagMap } = useTagTreeStoreWithSetter();

  // Fill out the data
  const [label, setLabel] = useState(id ? exerciseMap[id].label : '');
  const [selected, setSelected] = useState<{
    chosen: number[];
    preSelected: Set<number>;
  }>(() => {
    if (id) {
      const chosenTags = [...exerciseMap[id].tags];
      const preSelected = new Set(
        chosenTags.flatMap((tag) => getAllParentIds(tagMap, tag))
      );

      return {
        chosen: chosenTags,
        preSelected: preSelected,
      };
    } else {
      return {
        chosen: [],
        preSelected: new Set(),
      };
    }
  });

  const handleOnPress = () => {
    if (!label) return;

    const trimmedLabel = label.trim();
    if (!isValidTagOrExercise(trimmedLabel)) return;

    if (id) {
      exerciseSetter.updateExercise(id, {
        ...exerciseMap[id],
        label: trimmedLabel,
        value: formatTagOrExercise(trimmedLabel),
        tags: new Set(selected.chosen),
      });
    } else {
      const newExercise: Exercise = {
        id: Date.now(),
        label: trimmedLabel,
        value: formatTagOrExercise(trimmedLabel),
        order: 0, // since new exercise will be at the top
        tags: new Set(selected.chosen),
      };

      exerciseSetter.createExercise(newExercise);
    }

    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: id ? 'Edit' : 'Create',
          headerBackTitle: 'Exercises',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleOnPress}
              disabled={label.trim() === ''}
              className="px-4 py-2 rounded-md bg-blue-500"
            >
              <Text className="text-white">{id ? 'Update' : 'Add'}</Text>
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
        <Text className="text-xl">Select body section tags</Text>
        <TagTree
          tagMap={tagMap}
          tagChildren={[0]}
          level={0}
          selected={selected}
          setSelected={setSelected}
        />
      </View>
    </>
  );
}

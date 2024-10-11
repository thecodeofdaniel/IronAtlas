import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTagTreeStoreWithSetter } from '@/store/tagTreeStore';
import { ModalData } from '@/store/modalStore';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';

type Props = {
  modalData: ModalData['updateTag'];
  closeModal: () => void;
};

export default function EditTag({ modalData, closeModal }: Props) {
  const router = useRouter();

  const id = modalData.id;
  const { tagMap, tagSet, setter } = useTagTreeStoreWithSetter();
  const ogName = tagMap[id].label;

  // Prefill the input with the existing exercise name
  const [name, setName] = useState(ogName);

  // Handle the update button press
  const handleUpdate = () => {
    if (!isValidTagOrExercise(name)) {
      console.log('Not a valid tag name:', name);
      return;
    }

    const tagValue = formatTagOrExercise(name);
    const tagLabel = name.trim();

    if (tagSet.has(tagValue) && tagMap[id].label === tagLabel) {
      console.log('Tag alreay exists', name);
      return;
    }

    setter.editTagTitle(id, tagLabel, tagValue);
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
        <Text className="text-xl mb-2">Edit Tag Name</Text>
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

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTagStoreWithSetter } from '@/store/zustand/tag/tagStore';
import { ModalData } from '@/store/zustand/modal/modalStore';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';

type Props = {
  modalData: ModalData['updateTag'];
  closeModal: () => void;
};

export default function EditTag({ modalData, closeModal }: Props) {
  const router = useRouter();

  const id = modalData.id;
  const { tagMap, tagSet, setter } = useTagStoreWithSetter();
  const ogName = tagMap[id].label;
  const [name, setName] = useState(ogName);
  const [error, setError] = useState('');

  // Prefill the input with the existing exercise name

  // Handle the update button press
  const handleUpdate = () => {
    const tagLabel = name.trim();

    if (tagLabel === '') {
      setError('Give a name to the tag :)');
      return;
    }

    if (tagLabel === ogName) {
      router.back();
    }

    if (!isValidTagOrExercise(tagLabel)) {
      setError('Not a valid tag name!');
      return;
    }

    const tagValue = formatTagOrExercise(tagLabel);
    if (tagSet.has(tagValue)) {
      setError(`Tag name with ${tagLabel} already exists`);
      return;
    }

    setter.editTagTitle(id, tagLabel, tagValue);
    closeModal();
    router.back();
  };

  // Handle the cancel button press
  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Edit' }} />
      <View className="flex-1 gap-2 bg-neutral p-4">
        <View className="gap-1">
          <Text className="text-lg font-medium text-white">Tag Name</Text>
          <TextInput
            className="h-10 border border-gray-400 px-2 text-neutral-contrast"
            value={name}
            onChangeText={setName}
          />
          {error && <Text className="text-red-500">{error}</Text>}
        </View>
        <View className="flex flex-row justify-between gap-2">
          <MyButtonOpacity onPress={handleCancel} className="flex-1">
            <Text className="text-center font-medium text-white">Cancel</Text>
          </MyButtonOpacity>
          <MyButtonOpacity
            onPress={handleUpdate}
            className="flex-1 bg-green-500"
          >
            <Text className="text-center font-medium text-white">Update</Text>
          </MyButtonOpacity>
        </View>
      </View>
    </>
  );
}

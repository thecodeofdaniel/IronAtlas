import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useTagStoreWithSetter } from '@/store/tag/tagStore';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';

type Props = {
  modalData: ModalData['createTag'];
  closeModal: () => void;
};

export default function CreateTag({ modalData, closeModal }: Props) {
  const pressedId = modalData.pressedId;
  const router = useRouter();
  const { tagMap, tagSet, setter } = useTagStoreWithSetter();
  const [name, setName] = useState('');

  const handleCancel = () => {
    closeModal();
    router.back();
  };

  const handleUpdate = () => {
    if (!isValidTagOrExercise(name)) {
      // console.log('Not a valid tag name:', name);
      return;
    }

    if (tagSet.has(formatTagOrExercise(name))) {
      // console.log('Tag alreay exists', name);
      return;
    }

    setter.createChildTag(pressedId, name.trim());
    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Add' }} />
      <View className="flex-1 p-4">
        <Text className="mb-2 text-xl">
          Add tag under{' '}
          <Text className="font-bold underline">{tagMap[pressedId].label}</Text>
        </Text>
        <TextInput
          className="h-10 border border-gray-400 px-2"
          value={name}
          onChangeText={setName}
          placeholder="Enter exercise name"
        />
        <View className="mt-4 flex-row justify-between">
          <Button title="Cancel" onPress={handleCancel} color="red" />
          <Button
            title="Update"
            onPress={handleUpdate}
            disabled={name === ''}
          />
        </View>
      </View>
    </>
  );
}

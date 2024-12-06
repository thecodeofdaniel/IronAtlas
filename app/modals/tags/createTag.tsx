import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { ModalData } from '@/store/zustand/modal/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useTagStoreWithSetter } from '@/store/zustand/tag/tagStore';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import { useThemeContext } from '@/store/context/themeContext';

type Props = {
  modalData: ModalData['createTag'];
  closeModal: () => void;
};

export default function CreateTag({ modalData, closeModal }: Props) {
  const pressedId = modalData.pressedId;
  const router = useRouter();
  const { tagMap, tagSet, setter } = useTagStoreWithSetter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCancel = () => {
    closeModal();
    router.back();
  };

  const handleCreate = () => {
    if (name.trim() === '') {
      setError('Name cannot be blank');
      return;
    }

    if (!isValidTagOrExercise(name)) {
      setError('Not a valid tag name! Only use letters');
      return;
    }

    if (tagSet.has(formatTagOrExercise(name))) {
      setError('Tag already exists!');
      return;
    }

    setter.createChildTag(pressedId, name.trim());
    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{ headerTitle: `Create Tag Under ${tagMap[pressedId].label}` }}
      />
      <View className="flex-1 gap-2 bg-neutral p-4">
        <View className="gap-1">
          <Text className="text-lg font-medium text-neutral-contrast">
            Tag Name
          </Text>
          <TextInput
            className="h-10 border border-neutral-accent px-2 text-neutral-contrast"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
          />
          {error && <Text className="text-red-500">{error}</Text>}
        </View>
        <View className="flex flex-row justify-between gap-2">
          <MyButtonOpacity className="flex-1">
            <Text className="text-center text-white" onPress={handleCancel}>
              Cancel
            </Text>
          </MyButtonOpacity>
          <MyButtonOpacity
            className="flex-1 bg-green-500"
            onPress={handleCreate}
          >
            <Text className="text-center text-white">Add</Text>
          </MyButtonOpacity>
        </View>
      </View>
    </>
  );
}

// Add exercise

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exerciseStore';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTagTreeStoreWithSetter } from '@/store/tagTreeStore';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';

type Props = {
  modalData: ModalData['createExercise'];
  closeModal: () => void;
};

type TagItem = {
  label: string;
  value: string;
  selectable: boolean;
  disabled: boolean;
};

export default function CreateExercise({ modalData, closeModal }: Props) {
  const createExercise = useExerciseStore((state) => state.createExercise);
  const { tagMap, setter } = useTagTreeStoreWithSetter();
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  // const [items, setItems] = useState([
  //   { label: 'Apple', value: 'apple' },
  //   { label: 'Banana', value: 'banana' },
  //   { label: 'Pear', value: 'pear' },
  // ]);
  const [items, setItems] = useState(() => {
    const arr: TagItem[] = [];

    Object.values(tagMap).forEach((tag) => {
      arr.push({
        label: tag.label,
        value: tag.value,
        selectable: true,
        disabled: false,
      });
    });

    return arr;
  });

  const router = useRouter();

  const addExercise = () => {
    if (!name) return;

    const trimmedName = name.trim();

    if (!isValidTagOrExercise(trimmedName)) return;

    const newExercise = {
      id: Date.now(),
      label: name,
      value: formatTagOrExercise(name),
      order: 0, // since new exercise will be at the top
    };

    createExercise(newExercise);

    closeModal();
    router.back();
  };

  const handleSelect = (items: TagItem) => {};

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Add' }} />
      <View className="flex-1 p-4">
        <Text className="text-xl mb-2">Exercise Name</Text>
        <TextInput
          className="h-10 border px-2 border-gray-400"
          value={name}
          onChangeText={setName}
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
          <Button
            title="Create"
            onPress={addExercise}
            disabled={name.trim() === ''}
          />
        </View>
        <View className="flex-1">
          <View className="flex-1 items-center justify-center px-4">
            <DropDownPicker
              multiple={true}
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              // setItems={setItems}
              placeholder={'Choose a fruit.'}
              disabledItemLabelStyle={{ opacity: 0.2 }}
            />
          </View>
          <View className="flex-1 items-center justify-center">
            <Text>Chosen fruit: {value === null ? 'none' : value}</Text>
          </View>
        </View>
      </View>
    </>
  );
}

import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import React, { useState } from 'react';
import { ModalData } from '@/store/modalStore';
import {
  TagTreeStateFunctions,
  useTagTreeStoreWithSetter,
} from '@/store/tagTreeStore';
import clsx from 'clsx';
import { Stack, useRouter } from 'expo-router';

type Props = {
  modalData: ModalData['moveTag'];
  closeModal: () => void;
};

type TreeProps = {
  tagMap: TagMap; // Accept itemMap as a prop
  tagChildren: number[]; // Accept item IDs as a prop
  level: number;
  setter: TagTreeStateFunctions;
  idToBeMoved: number;
  selected: number | null;
  setSelected: React.Dispatch<React.SetStateAction<number | null>>;
};

const Tree = ({
  tagMap,
  tagChildren,
  level = 0,
  setter,
  idToBeMoved,
  selected,
  setSelected,
}: TreeProps) => {
  const RenderItem = ({ item }: { item: Tag }) => {
    const isDisabled =
      idToBeMoved === item.id || item.id === tagMap[idToBeMoved].parentId;
    return (
      <TouchableOpacity
        activeOpacity={1}
        disabled={isDisabled}
        className={clsx('p-2 my-[1]', {
          'bg-blue-800': selected !== item.id,
          'bg-red-600': selected === item.id,
          'bg-gray-400': isDisabled,
        })}
        onPress={() => setSelected(item.id)}
      >
        {/* Tags and options */}
        <View className="flex flex-row items-center justify-between flex-1">
          <Text className="text-white">
            {item.title} {idToBeMoved === item.id && ' <'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const tags = tagChildren.map((id) => tagMap[id]);

  return (
    <View>
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <View key={item.id} style={{ paddingLeft: 5 * level }}>
              <RenderItem item={item} />
              {item.children.length > 0 && item.id !== idToBeMoved && (
                <Tree
                  tagMap={tagMap}
                  tagChildren={item.children}
                  level={level + 1}
                  setter={setter}
                  idToBeMoved={idToBeMoved}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default function MoveTag({ modalData, closeModal }: Props) {
  const idToBeMoved = modalData.pressedId;
  const { tagMap, setter } = useTagTreeStoreWithSetter();
  const [selected, setSelected] = useState<number | null>(null);
  const router = useRouter();

  const handleCancel = () => {
    closeModal();
    router.back();
  };

  const handleUpdate = () => {
    if (selected === null) return;
    setter.moveTag(selected, idToBeMoved);
    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{ headerTitle: 'Move Tag', headerBackTitle: 'Tags' }}
      />
      <View className="p-2 flex flex-col gap-2">
        <Text className="text-xl font-medium">
          Select the tag you want to put this under
        </Text>
        <Tree
          tagMap={tagMap}
          tagChildren={[0]}
          level={0}
          setter={setter}
          idToBeMoved={idToBeMoved}
          selected={selected}
          setSelected={setSelected}
        />
        <View className="flex flex-row justify-between">
          <Button title="Cancel" color={'red'} onPress={handleCancel} />
          <Button
            title="Update"
            disabled={selected === null}
            onPress={handleUpdate}
          />
        </View>
      </View>
    </>
  );
}

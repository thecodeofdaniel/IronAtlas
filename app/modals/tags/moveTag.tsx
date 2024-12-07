import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import React, { useState } from 'react';
import { ModalData } from '@/store/zustand/modal/modalStore';
import { useTagStoreHook } from '@/store/zustand/tag/tagStore';
import clsx from 'clsx';
import { Stack, useRouter } from 'expo-router';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import { cn } from '@/lib/utils';

type Props = {
  modalData: ModalData['moveTag'];
  closeModal: () => void;
};

type TreeProps = {
  tagMap: TagMap; // Accept itemMap as a prop
  tagChildren: number[]; // Accept item IDs as a prop
  level: number;
  idToBeMoved: number;
  selected: number | null;
  setSelected: React.Dispatch<React.SetStateAction<number | null>>;
};

const Tree = ({
  tagMap,
  tagChildren,
  level = 0,
  idToBeMoved,
  selected,
  setSelected,
}: TreeProps) => {
  const RenderItem = ({ item }: { item: Tag }) => {
    // Disable the tags that should be touched
    const isDisabled =
      idToBeMoved === item.id || item.id === tagMap[idToBeMoved].parentId;
    return (
      <MyButtonOpacity
        activeOpacity={1}
        disabled={isDisabled}
        className={cn('my-[1] bg-neutral-accent p-2', {
          'bg-primary': selected === item.id,
          'border-black/20 bg-neutral-accent/20': isDisabled,
        })}
        onPress={() => setSelected(item.id)}
      >
        {/* Tags and options */}
        <View className="flex flex-1 flex-row items-center justify-between">
          <Text
            className={cn('text-white', {
              'font-medium underline': idToBeMoved === item.id,
            })}
          >
            {item.label}
          </Text>
        </View>
      </MyButtonOpacity>
    );
  };

  const tags = tagChildren.map((id) => tagMap[id]);

  return (
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
                idToBeMoved={idToBeMoved}
                selected={selected}
                setSelected={setSelected}
              />
            )}
          </View>
        );
      }}
    />
  );
};

export default function MoveTag({ modalData, closeModal }: Props) {
  const idToBeMoved = modalData.pressedId;
  const { tagMap, setter } = useTagStoreHook();
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCancel = () => {
    closeModal();
    router.back();
  };

  const handleUpdate = () => {
    if (selected === null) {
      setError('Select a tag to move under :)');
      return;
    }

    setter.moveTag(selected, idToBeMoved);
    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Move Tag - ${tagMap[idToBeMoved].label}`,
          headerBackTitle: 'Tags',
        }}
      />
      <ScreenLayoutWrapper className="flex-1 gap-2">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-medium text-neutral-contrast">
            Select the tag you want to put this under
          </Text>
          <Tree
            tagMap={tagMap}
            tagChildren={[0]}
            level={0}
            idToBeMoved={idToBeMoved}
            selected={selected}
            setSelected={setSelected}
          />
          {error && <Text className="text-red-500">{error}</Text>}
        </View>
        <View className="flex flex-row justify-between">
          <MyButtonOpacity onPress={handleCancel}>
            <Text className="font-medium text-white">Cancel</Text>
          </MyButtonOpacity>
          <MyButtonOpacity onPress={handleUpdate} className="bg-green-500">
            <Text className="font-medium text-white">Move</Text>
          </MyButtonOpacity>
        </View>
      </ScreenLayoutWrapper>
    </>
  );
}

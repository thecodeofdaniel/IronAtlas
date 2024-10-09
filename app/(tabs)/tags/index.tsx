import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Pressable, Button } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import {
  useTagTreeStoreWithSetter,
  type TagTreeStateFunctions,
} from '@/store/tagTreeStore';
import {
  ActionSheetProvider,
  useActionSheet,
} from '@expo/react-native-action-sheet';
import { Stack, useRouter } from 'expo-router';
import { useModalStore } from '@/store/modalStore';

type TreeProps = {
  tagMap: TagMap; // Accept itemMap as a prop
  tagChildren: number[]; // Accept item IDs as a prop
  level: number;
  setter: TagTreeStateFunctions;
};

const Tree = ({ tagMap, tagChildren, level = 0, setter }: TreeProps) => {
  // console.log('Render Tree');
  const [isOpen, setIsOpen] = useState(() =>
    tagChildren.map((id) => tagMap[id].isOpen)
  );
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);

  const handleOnPress = (pressedId: number, level: number) => {
    const baseOptions = ['Create', 'Cancel'];
    const options = [
      ...(level > 0 ? ['Delete', 'Edit', 'Move'] : []),
      ...baseOptions,
    ];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = level > 0 ? 0 : undefined;

    const actions = {
      Delete: () => setter.deleteTag(pressedId),
      Create: () => openModal('createTag', { pressedId }),
      Edit: () => openModal('updateTag', { id: pressedId }),
      Move: () => openModal('moveTag', { pressedId }),
    };

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex?: number) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex)
          return;

        const action = actions[options[selectedIndex] as keyof typeof actions];
        action();
        if (options[selectedIndex] !== 'Delete') router.push('/modal');
      }
    );
  };

  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Tag>) => {
    const currentIndex = getIndex()!;

    return (
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        className={clsx('p-2 my-[1] flex flex-row', {
          'bg-red-500': isActive,
          'bg-blue-800': !isActive,
        })}
      >
        {item.children.length > 0 && (
          <Pressable
            onPress={() => {
              const newIsOpen = [...isOpen];
              newIsOpen[currentIndex] = !isOpen[currentIndex];
              setIsOpen(newIsOpen);
            }}
          >
            <Ionicons
              name={
                isOpen[currentIndex]
                  ? 'chevron-down'
                  : 'chevron-forward-outline'
              }
              size={18}
              style={{ marginRight: 12 }}
              color={'white'}
            />
          </Pressable>
        )}
        {/* Tags and options */}
        <View className="flex flex-row items-center justify-between flex-1">
          <Text className="text-white">{item.title}</Text>
          <TouchableOpacity onPress={() => handleOnPress(item.id, level)}>
            <Ionicons name="ellipsis-horizontal-outline" color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const tags: Tag[] = tagChildren.map((id) => tagMap[id]);

  return (
    <View>
      <DraggableFlatList
        data={tags}
        onDragEnd={({ data }) => {
          setter.reorderTags(data);
        }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, drag, isActive, getIndex }) => {
          const currentIndex = tagChildren.indexOf(item.id);
          return (
            <View key={item.id} style={{ paddingLeft: 5 * level }}>
              <RenderItem
                item={item}
                drag={drag}
                isActive={isActive}
                getIndex={getIndex}
              />
              {item.children.length > 0 && isOpen[currentIndex] && (
                <Tree
                  tagMap={tagMap}
                  tagChildren={item.children}
                  level={level + 1}
                  setter={setter}
                />
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default function TagTab() {
  const { tagMap, setter } = useTagTreeStoreWithSetter();

  return (
    <>
      <Stack.Screen
        options={{ title: 'Body Section Tags', headerShown: true }}
      />
      <View className="flex flex-1 pt-2 px-2">
        <GestureHandlerRootView>
          <ActionSheetProvider>
            <Tree tagMap={tagMap} tagChildren={[0]} level={0} setter={setter} />
          </ActionSheetProvider>
        </GestureHandlerRootView>
      </View>
    </>
  );
}

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
import { useRouter } from 'expo-router';
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

  const handleOnPress = (pressedId: number) => {
    console.log('By', pressedId);
    const options = ['Delete', 'Create', 'Edit', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            setter.deleteTag(pressedId);
            break;
          case 1:
            openModal('addExerciseOrMuscle', { pressedId: pressedId });
            router.push('/modal');
            // setter.createChild(pressedId);
            break;
          case 2:
            openModal('editExerciseOrMuscle', { id: pressedId });
            router.push('/modal');
            break;
          case cancelButtonIndex:
            break;
        }
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
          <View className="flex flex-row gap-4">
            {item.children.length === 0 ? (
              <Ionicons name="barbell" color={'white'} />
            ) : (
              <Ionicons name="body-outline" color={'white'} />
            )}
            <TouchableOpacity onPress={() => handleOnPress(item.id)}>
              <Ionicons name="ellipsis-horizontal-outline" color="white" />
            </TouchableOpacity>
          </View>
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
    <View className="flex flex-1 p-4">
      <Text className="text-3xl font-bold mb-4">Item Tree</Text>
      <GestureHandlerRootView>
        <ActionSheetProvider>
          <Tree tagMap={tagMap} tagChildren={[0]} level={0} setter={setter} />
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </View>
  );
}

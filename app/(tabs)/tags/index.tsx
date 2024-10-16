import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Pressable, Button } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import { useTagStoreWithSetter, TagStateFunctions } from '@/store/tagStore';
import {
  ActionSheetProvider,
  useActionSheet,
} from '@expo/react-native-action-sheet';
import { Stack, useRouter } from 'expo-router';
import { useModalStore } from '@/store/modalStore';
import {
  ExerciseStateFunctions,
  useExerciseStore,
  useExerciseStoreWithSetter,
} from '@/store/exerciseStore';

type DraggableTreeProps = {
  tagMap: TagMap; // Accept itemMap as a prop
  tagChildren: number[]; // Accept item IDs as a prop
  level: number;
  setter: TagStateFunctions;
  exerciseSetter: ExerciseStateFunctions;
};

const DraggableTree = ({
  tagMap,
  tagChildren,
  level = 0,
  setter,
  exerciseSetter,
}: DraggableTreeProps) => {
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);

  const handleOnPress = (pressedId: number, level: number) => {
    const tag = tagMap[pressedId];
    const baseOptions = ['Create', 'Cancel'];
    const options = [
      ...(level > 0 && tag.children.length === 0 ? ['Delete'] : []),
      ...(level > 0 ? ['Edit', 'Move'] : []),
      ...baseOptions,
    ];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = options.indexOf('Delete');

    const actions = {
      Delete: () => {
        // grab the associated exercises with that tag
        // go through each exercise and delete that tag from set
        const exerciseIds = [...tagMap[pressedId].exercises];
        exerciseIds.forEach((exerciseId) =>
          exerciseSetter.removeTagFromExercise(exerciseId, pressedId)
        );

        // delete tag itself
        setter.deleteTag(pressedId);
      },
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
        className={clsx('p-2 my-[1] flex flex-row items-center', {
          'bg-red-500': isActive,
          'bg-blue-800': !isActive,
        })}
      >
        {item.children.length > 0 && (
          <Pressable
            onPress={() => {
              setter.toggleTagOpen(item.id);
            }}
          >
            <Ionicons
              name={item.isOpen ? 'chevron-down' : 'chevron-forward-outline'}
              size={14}
              style={{ marginRight: 4 }}
              color={'white'}
            />
          </Pressable>
        )}
        {/* Tags and options */}
        <View className="flex flex-row items-center justify-between flex-1">
          <Text className="text-white">{item.label}</Text>
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
          return (
            <View key={item.id} style={{ paddingLeft: 3 * level }}>
              <RenderItem
                item={item}
                drag={drag}
                isActive={isActive}
                getIndex={getIndex}
              />
              {item.children.length > 0 && item.isOpen && (
                <DraggableTree
                  tagMap={tagMap}
                  tagChildren={item.children}
                  level={level + 1}
                  setter={setter}
                  exerciseSetter={exerciseSetter}
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
  const { tagMap, setter } = useTagStoreWithSetter();
  const { setter: exerciseSetter } = useExerciseStoreWithSetter();

  return (
    <>
      <Stack.Screen
        options={{ title: 'Body Section Tags', headerShown: true }}
      />
      <View className="flex flex-1 pt-2 px-2">
        <GestureHandlerRootView>
          <ActionSheetProvider>
            <DraggableTree
              tagMap={tagMap}
              tagChildren={[0]}
              level={0}
              setter={setter}
              exerciseSetter={exerciseSetter}
            />
          </ActionSheetProvider>
        </GestureHandlerRootView>
      </View>
    </>
  );
}

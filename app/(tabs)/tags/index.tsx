import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import {
  useTagStoreHook,
  type TagStateFunctions,
} from '@/store/zustand/tag/tagStore';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Stack, useRouter } from 'expo-router';
import { useModalStore } from '@/store/zustand/modal/modalStore';
import {
  ExerciseStateFunctions,
  useExerciseStoreHook,
} from '@/store/zustand/exercise/exerciseStore';
import { Link } from 'expo-router';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';
import { useThemeContext } from '@/store/context/themeContext';
import { cn } from '@/lib/utils';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import OpenModalWrapper from '@/components/OpenModalWrapper';
import TextContrast from '@/components/ui/TextContrast';

type DraggableTreeProps = {
  tagMap: TagMap; // Accept itemMap as a prop
  tagChildren: number[]; // Accept item IDs as a prop
  level: number;
  tagSetter: TagStateFunctions;
  exerciseSetter: ExerciseStateFunctions;
};

const DraggableTree = ({
  tagMap,
  tagChildren,
  level = 0,
  tagSetter,
  exerciseSetter,
}: DraggableTreeProps) => {
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);
  const { colors } = useThemeContext();

  const handleOnPress = (pressedId: number) => {
    const tag = tagMap[pressedId];
    const options = [
      ...(tag.children.length === 0 ? ['Delete'] : []),
      'Edit',
      'Move',
      'Create',
      'Cancel',
    ];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = options.indexOf('Delete');

    const actions = {
      Delete: async () => {
        await tagSetter.deleteTag(pressedId);
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
        ...getActionSheetStyle(colors),
      },
      (selectedIndex?: number) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex)
          return;

        const action = actions[options[selectedIndex] as keyof typeof actions];
        action();

        // If not the delete option then push modal
        if (options[selectedIndex] !== 'Delete') router.push('/modal');
      },
    );
  };

  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Tag>) => {
    return (
      <Link
        href={{
          pathname: '/(tabs)/tags/[tagId]',
          params: { tagId: item.id.toString() },
        }}
        asChild
      >
        <MyButtonOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive}
          className={cn('my-[1] flex flex-row items-center px-1', {
            'bg-red-700': isActive,
          })}
        >
          <TouchableOpacity
            onPress={() => {
              tagSetter.toggleTagOpen(item.id);
            }}
          >
            {/* Dropdown option */}
            {item.children.length > 0 && (
              <Ionicons
                name={item.isOpen ? 'chevron-down' : 'chevron-forward-outline'}
                size={20}
                color="white"
              />
            )}
          </TouchableOpacity>

          {/* Tags and options */}
          <View className="flex flex-1 flex-row items-center justify-between pl-1">
            <Text className="text-white">{item.label}</Text>
            <TouchableOpacity onPress={() => handleOnPress(item.id)}>
              <Ionicons name="ellipsis-horizontal" color="white" size={24} />
            </TouchableOpacity>
          </View>
        </MyButtonOpacity>
      </Link>
    );
  };

  const tags: Tag[] = tagChildren.map((id) => tagMap[id]);

  return (
    <View>
      <DraggableFlatList
        data={tags}
        onDragEnd={({ data }) => {
          tagSetter.reorderTags(data);
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
                  tagSetter={tagSetter}
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
  const { colors } = useThemeContext();
  const { tagMap, setter: tagSetter } = useTagStoreHook();
  const { setter: exerciseSetter } = useExerciseStoreHook();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Body Section Tags',
          headerRight: () => (
            <OpenModalWrapper
              activeModal="createTag"
              modalData={{ pressedId: 0 }}
            >
              <TouchableOpacity>
                <Ionicons
                  name="add"
                  size={24}
                  color={colors['--neutral-contrast']}
                />
              </TouchableOpacity>
            </OpenModalWrapper>
          ),
        }}
      />
      <ScreenLayoutWrapper>
        {tagMap[0].children.length === 0 && (
          <View className="flex-1 items-center justify-center">
            <TextContrast>No Tags Found</TextContrast>
            <MyButtonOpacity>
              <Text className="font-medium text-white">Add Tags</Text>
            </MyButtonOpacity>
          </View>
        )}
        {tagMap[0].children.length > 0 && (
          <GestureHandlerRootView>
            <DraggableTree
              tagMap={tagMap}
              tagChildren={tagMap[0].children}
              level={0}
              tagSetter={tagSetter}
              exerciseSetter={exerciseSetter}
            />
          </GestureHandlerRootView>
        )}
      </ScreenLayoutWrapper>
    </>
  );
}

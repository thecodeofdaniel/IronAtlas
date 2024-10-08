import {
  ExerciseStateFunctions,
  useExerciseStoreWithSetter,
} from '@/store/exerciseStore';
import { useModalStore } from '@/store/modalStore';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type ExerciseListProps = {
  exercises: Exercise[];
  setter: ExerciseStateFunctions;
};

function ExerciseList({ exercises, setter }: ExerciseListProps) {
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);
  const router = useRouter();

  const handleOnPress = (pressedId: number) => {
    console.log('By', pressedId);
    const options = ['Delete', 'Edit', 'Cancel'];
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
            handleDelete(pressedId);
            break;
          case 1:
            openModal('editExercise', { id: pressedId });
            router.push('/modal');
            break;
          case cancelButtonIndex:
            break;
        }
      }
    );
  };

  const handleDelete = (pressedId: number) => {
    setter.deleteExercise(pressedId);
  };

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Exercise>) => {
    const index = getIndex()!;

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
        <View className="flex flex-row justify-between flex-1">
          <Text className="text-white">
            {item.title} @{index}
          </Text>
          <TouchableOpacity onPress={() => handleOnPress(exercises[index].id)}>
            <Ionicons name="ellipsis-horizontal-outline" color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 pt-2 px-2">
      <GestureHandlerRootView>
        <DraggableFlatList
          data={exercises}
          onDragEnd={({ data }) => setter.setExercises(data)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      </GestureHandlerRootView>
    </View>
  );
}

export default function Exercises() {
  const { exercises, setter } = useExerciseStoreWithSetter();
  const { showActionSheetWithOptions } = useActionSheet();
  const openModal = useModalStore((state) => state.openModal);
  const router = useRouter();

  const handlePress = () => {
    const options = ['Add Exercise', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            openModal('createExercise');
            router.push('/modal');
            break;
          case cancelButtonIndex:
            break;
        }
      }
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Exercises',
          headerShown: true,
          headerRight: () => {
            return (
              <TouchableOpacity onPress={handlePress}>
                <Ionicons name="add" size={24} />
              </TouchableOpacity>
            );
          },
        }}
      />
      <ExerciseList exercises={exercises} setter={setter} />
    </>
  );
}

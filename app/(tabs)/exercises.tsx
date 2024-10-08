import {
  ActionSheetProvider,
  useActionSheet,
} from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Exercise = {
  id: number;
  title: string;
};

const exercisesInitial: Exercise[] = [
  {
    id: 1,
    title: 'Bench Press',
  },
  {
    id: 2,
    title: 'Squats',
  },
  {
    id: 3,
    title: 'Pullup',
  },
  {
    id: 4,
    title: 'Deadlift',
  },
];

function ExerciseList() {
  const [exercises, setExercises] = useState<Exercise[]>(exercisesInitial);
  const { showActionSheetWithOptions } = useActionSheet();

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
            break;
          case cancelButtonIndex:
            break;
        }
      }
    );
  };

  const handleDelete = (pressedId: number) => {
    setExercises((prev) => {
      return prev.filter((exercise) => exercise.id !== pressedId);
    });
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

  console.log(exercises);

  return (
    <View className="pt-8 flex-1">
      <Text>exercises</Text>
      <GestureHandlerRootView>
        <DraggableFlatList
          data={exercises}
          onDragEnd={({ data }) => setExercises(data)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      </GestureHandlerRootView>
    </View>
  );
}

export default function Exercises() {
  return (
    <ActionSheetProvider>
      <ExerciseList />
    </ActionSheetProvider>
  );
}

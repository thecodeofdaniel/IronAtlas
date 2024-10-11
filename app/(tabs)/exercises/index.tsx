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
  exerciseMap: ExerciseMap;
  exerciseList: number[];
  setter: ExerciseStateFunctions;
};

function ExerciseList({
  exerciseMap,
  exerciseList,
  setter,
}: ExerciseListProps) {
  console.log('Render ExerciseList');
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
            // First update the list, then delete from map
            // const newList = exerciseList.filter((id) => id !== pressedId);
            // setter.setExercises(newList);
            setter.deleteExercise(pressedId);
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

  const renderItem = ({
    item: exerciseId,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<number>) => {
    const index = getIndex()!;
    const exercise = exerciseMap[exerciseId];

    // Skip rendering if exercise doesn't exist in map
    if (!exercise) {
      return null;
    }

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
            {exercise.label} @{index}
          </Text>
          <TouchableOpacity onPress={() => handleOnPress(exerciseId)}>
            <Ionicons name="ellipsis-horizontal" color="white" size={24} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter out any IDs that don't exist in the map
  const validExerciseList = exerciseList.filter((id) => exerciseMap[id]);
  console.log(validExerciseList);

  return (
    <View className="flex-1 pt-2 px-2">
      <GestureHandlerRootView>
        <DraggableFlatList
          data={validExerciseList}
          onDragEnd={({ data }) => setter.setExercises(data)}
          keyExtractor={(id) => {
            const exercise = exerciseMap[id];
            console.log(`${exercise} with ${id}`);
            return exercise ? exercise.id.toString() : id.toString();
            // return exercise.id.toString();
          }}
          renderItem={renderItem}
        />
      </GestureHandlerRootView>
    </View>
  );
}

export default function ExercisesTab() {
  const { exerciseMap, exercisesList, setter } = useExerciseStoreWithSetter();
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
      <ExerciseList
        exerciseMap={exerciseMap}
        exerciseList={exercisesList}
        setter={setter}
      />
    </>
  );
}

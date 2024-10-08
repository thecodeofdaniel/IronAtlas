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

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>(exercisesInitial);

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Exercise>) => {
    const index = getIndex();

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
        <Text className="text-white">
          {item.title} @{index}
        </Text>
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

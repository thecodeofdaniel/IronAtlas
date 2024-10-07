import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Pressable, Button } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import {
  useExerciseTreeStoreWithSetter,
  type Exercise,
  type ExerciseMap,
  type ExerciseTreeStateFunctions,
} from '@/store/exerciseTreeStore';

type TreeProps = {
  exerciseMap: ExerciseMap; // Accept itemMap as a prop
  exerciseChildren: number[]; // Accept item IDs as a prop
  level: number;
  setter: ExerciseTreeStateFunctions;
};

const Tree = ({
  exerciseMap,
  exerciseChildren,
  level = 0,
  setter,
}: TreeProps) => {
  const [isOpen, setIsOpen] = useState(() =>
    exerciseChildren.map((id) => exerciseMap[id].isOpen)
  );

  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Exercise>) => {
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
              <Ionicons name="pricetag" color={'white'} />
            )}
            {/* The root item would not have  */}
            {level > 0 && (
              <TouchableOpacity onPress={() => setter.createChild(item.id)}>
                <Ionicons name="ellipsis-horizontal-outline" color="white" />
              </TouchableOpacity>
              // <Link href={'/modal'} asChild>
              //   <TouchableOpacity>
              //     <Ionicons name="ellipsis-horizontal-outline" color="white" />
              //   </TouchableOpacity>
              // </Link>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const exercises: Exercise[] = exerciseChildren.map((id) => exerciseMap[id]);

  return (
    <View>
      <DraggableFlatList
        data={exercises}
        onDragEnd={({ data }) => {
          setter.reorder(data);
        }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, drag, isActive, getIndex }) => {
          const currentIndex = exerciseChildren.indexOf(item.id);
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
                  exerciseMap={exerciseMap}
                  exerciseChildren={item.children}
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

const App = () => {
  const { exerciseMap, setter } = useExerciseTreeStoreWithSetter();

  return (
    <View className="flex flex-1 p-4">
      <Text className="text-3xl font-bold mb-4">Item Tree</Text>
      <GestureHandlerRootView>
        <Tree
          exerciseMap={exerciseMap}
          exerciseChildren={[0]}
          level={0}
          setter={setter}
        />
      </GestureHandlerRootView>
    </View>
  );
};

export default App;

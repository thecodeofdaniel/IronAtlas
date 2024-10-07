import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Pressable, Button } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import {
  ExerciseTreeStateSetters,
  useExerciseTreeStoreWithSetter,
} from '@/store/exerciseTreeStore';

type Item = {
  id: number;
  title: string;
  parentId: number | null;
  order: number;
  isOpen: boolean;
  children: number[]; // Store only child IDs
};

type ItemMap = {
  [key: number]: Item; // Create an ItemMap type
};

const startingItems: ItemMap = {
  // Root
  0: {
    id: 0,
    title: 'Root',
    parentId: null,
    order: 0,
    isOpen: true,
    children: [1, 3],
  },
  1: {
    id: 1,
    title: 'Hello',
    parentId: 0,
    order: 0,
    isOpen: true,
    children: [2],
  },
  2: {
    id: 2,
    title: 'World',
    parentId: 1,
    order: 0,
    isOpen: false,
    children: [4, 5],
  },
  3: {
    id: 3,
    title: 'Goodbye',
    parentId: 0,
    order: 1,
    isOpen: false,
    children: [],
  },
  4: {
    id: 4,
    title: 'Again',
    parentId: 2,
    order: 0,
    isOpen: false,
    children: [],
  },
  5: {
    id: 5,
    title: 'Too',
    parentId: 2,
    order: 1,
    isOpen: false,
    children: [],
  },
};

type TreeProps = {
  itemMap: ItemMap; // Accept itemMap as a prop
  itemIds: number[]; // Accept item IDs as a prop
  level: number;
  setter: ExerciseTreeStateSetters;
};

const Tree = ({ itemMap, itemIds, level = 0, setter }: TreeProps) => {
  const [isOpen, setIsOpen] = useState(() =>
    itemIds.map((id) => itemMap[id].isOpen)
  );

  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Item>) => {
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

  const items: Item[] = itemIds.map((id) => itemMap[id]);

  return (
    <View>
      <DraggableFlatList
        data={items}
        onDragEnd={({ data: dataList }) => {
          setter.reorder(dataList);
        }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, drag, isActive, getIndex }) => {
          const currentIndex = itemIds.indexOf(item.id);
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
                  itemMap={itemMap}
                  itemIds={item.children}
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
  const { exerciseTree, setter } = useExerciseTreeStoreWithSetter();

  return (
    <View className="flex flex-1 p-4">
      <Text className="text-3xl font-bold mb-4">Item Tree</Text>
      <GestureHandlerRootView>
        <Tree itemMap={exerciseTree} itemIds={[0]} level={0} setter={setter} />
      </GestureHandlerRootView>
    </View>
  );
};

export default App;

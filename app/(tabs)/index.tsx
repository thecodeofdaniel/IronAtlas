import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Pressable, Button } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useBearStore } from '@/store/store';
import {
  ExerciseTreeStateSetters,
  useExerciseTreeStore,
  useExerciseTreeStoreFuncs,
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
  setItemMap: ExerciseTreeStateSetters;
};

const Tree = ({ itemMap, itemIds, level = 0, setItemMap }: TreeProps) => {
  const [isOpen, setIsOpen] = useState(() =>
    itemIds.map((id) => itemMap[id].isOpen)
  );

  const createChild = (pressedId: number) => {
    setItemMap((prevItems) => {
      const newItems = { ...prevItems };
      const pressedItem = newItems[pressedId];
      const nextIndex = pressedItem.children.length;

      const newItem: Item = {
        id: Date.now(), // Use a unique ID generator in a real scenario
        title: 'ZZZZZZZZZZZZZZZZ',
        parentId: pressedItem.id,
        order: nextIndex,
        isOpen: false,
        children: [],
      };

      // Create a new copy of the pressed item with the updated children array
      newItems[pressedId] = {
        ...pressedItem,
        children: [...pressedItem.children, newItem.id], // Create new array instead of using push
      };

      newItems[newItem.id] = newItem; // Add the new item to the map
      return newItems;
    });
  };

  const deleteItem = (itemId: number) => {
    setItemMap((prevItems) => {
      const newItems = { ...prevItems };

      // Helper function to recursively delete an item and all its children
      const deleteItemAndChildren = (id: number) => {
        const item = newItems[id];
        if (!item) return;

        // Recursively delete all children first
        item.children.forEach((childId) => {
          deleteItemAndChildren(childId);
        });

        // If this item has a parent, remove it from parent's children array
        if (item.parentId !== null && newItems[item.parentId]) {
          newItems[item.parentId] = {
            ...newItems[item.parentId],
            children: newItems[item.parentId].children.filter(
              (childId) => childId !== id
            ),
          };
        }

        // Delete the item itself
        delete newItems[id];
      };

      deleteItemAndChildren(itemId);
      return newItems;
    });
  };

  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Item>) => {
    const currentIndex = getIndex();

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
              // <TouchableOpacity onPress={() => deleteItem(item.id)}>
              //   <Ionicons name="ellipsis-horizontal-outline" color="white" />
              // </TouchableOpacity>
              <Link href={'/modal'} asChild>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal-outline" color="white" />
                </TouchableOpacity>
              </Link>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // console.log(itemIds);
  const items: Item[] = itemIds.map((id) => itemMap[id]);

  return (
    <View>
      <DraggableFlatList
        data={items}
        onDragEnd={({ data: dataList }) => {
          setItemMap.reorder(dataList);
        }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, drag, isActive, getIndex }) => {
          const currentIndex = itemIds.indexOf(item.id);
          return (
            <View key={item.id} style={{ paddingLeft: 10 * level }}>
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
                  setItemMap={setItemMap}
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
  console.log('Render Tree again');
  // const [itemMap, setItemMap] = useState<ItemMap>(startingItems);
  // const {
  //   exerciseTree: itemMap,
  //   reorder,
  //   createChild,
  //   deleteTagOrExercise,
  // } = useExerciseTreeStore((state) => state);

  const { exerciseTree: itemMap, setter } = useExerciseTreeStoreFuncs();

  // const [itemMap, setItemMap] = useState<ItemMap>(exerciseTree);

  // const setItemMap = {
  //   reorder,
  //   createChild,
  //   deleteTagOrExercise,
  // };

  // This would be zero
  const rootItemIds = Object.values(itemMap)
    .filter((item) => item.parentId === null)
    .sort((a, b) => a.order - b.order) // Sort by the 'order' key
    .map((item) => item.id);

  return (
    <View className="flex flex-1 p-4">
      <Text className="text-3xl font-bold mb-4">Item Tree</Text>
      <GestureHandlerRootView>
        <Tree
          itemMap={itemMap}
          itemIds={rootItemIds}
          level={0}
          setItemMap={setter}
        />
      </GestureHandlerRootView>
    </View>
  );
};

export default App;

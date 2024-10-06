import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Pressable } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';

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
  1: {
    id: 1,
    title: 'Hello',
    parentId: null,
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
    parentId: null,
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
  setItems: React.Dispatch<React.SetStateAction<ItemMap>>;
};

const Tree = ({ itemMap, itemIds, level = 0, setItems }: TreeProps) => {
  const [isOpen, setIsOpen] = useState(() =>
    itemIds.map((id) => itemMap[id].isOpen)
  );

  const createSibling = (parentId: number | null) => {
    if (parentId === null) return; // Early return if no parentId
    setItems((prevItems) => {
      const newItems = { ...prevItems };
      const parentItem = newItems[parentId];
      const nextIndex = parentItem.children.length;

      const newItem: Item = {
        id: Date.now(), // Use a unique ID generator in a real scenario
        title: 'ZZZZZZZZZZZZZZZZ',
        parentId: parentItem.id,
        order: nextIndex,
        isOpen: false,
        children: [],
      };

      parentItem.children.push(newItem.id);
      newItems[newItem.id] = newItem; // Add the new item to the map
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
        <View className="flex flex-row items-center justify-between flex-1">
          <Text className="text-white">{item.title}</Text>
          <View className="flex flex-row gap-4">
            {item.children.length === 0 ? (
              <Ionicons name="barbell" color={'white'} />
            ) : (
              <Ionicons name="pricetag" color={'white'} />
            )}
            <TouchableOpacity onPress={() => createSibling(item.parentId)}>
              <Ionicons name="ellipsis-horizontal-outline" color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {itemIds.map((id) => {
        const item = itemMap[id];
        return (
          <View key={item.id} style={{ paddingLeft: 10 * level }}>
            <RenderItem
              item={item}
              drag={() => {}}
              isActive={false}
              getIndex={() => itemIds.indexOf(item.id)}
            />
            {item.children.length > 0 && isOpen[itemIds.indexOf(item.id)] && (
              <Tree
                itemMap={itemMap}
                itemIds={item.children}
                level={level + 1}
                setItems={setItems}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const App = () => {
  const [items, setItems] = useState<ItemMap>(startingItems);

  const rootItemIds = Object.values(items)
    .filter((item) => item.parentId === null)
    .map((item) => item.id);

  return (
    <View className="flex flex-1 p-4">
      <Text className="text-3xl font-bold mb-4">Item Tree</Text>
      <GestureHandlerRootView>
        <Tree
          itemMap={items}
          itemIds={rootItemIds}
          level={0}
          setItems={setItems}
        />
      </GestureHandlerRootView>
    </View>
  );
};

export default App;

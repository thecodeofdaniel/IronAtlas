import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Pressable } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';

import Popover from 'react-native-popover-view';

type Item = {
  id: number;
  title: string;
  parentId: number | null;
  order: number;
  isOpen: boolean;
  children: Item[];
};

const startingItems: Item[] = [
  {
    id: 1,
    title: 'Hello',
    parentId: null,
    order: 0,
    isOpen: true,
    children: [
      {
        id: 2,
        title: 'World',
        parentId: 1,
        order: 0,
        isOpen: false,
        children: [
          {
            id: 4,
            title: 'Again',
            parentId: 2,
            order: 0,
            isOpen: false,
            children: [],
          },
          {
            id: 5,
            title: 'Too',
            parentId: 2,
            order: 1,
            isOpen: false,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Goodbye',
    parentId: null,
    order: 1,
    isOpen: false,
    children: [],
  },
];

type TreeProps = {
  items: Item[];
  level: number;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
};

const Tree = ({ items, level = 0, setItems }: TreeProps) => {
  const [dataList, setDataList] = useState<Item[]>(items);
  const [isOpen, setIsOpen] = useState(() => {
    return items.map((item) => {
      return item.isOpen;
    });
  });

  const createSibling = (parentId: number | null) => {
    try {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === parentId) {
            const nextIndex = item.children.length;

            const newObj = {
              id: Date.now(), // or generate a unique ID
              title: 'ZZZZZZZZZZZZZZZZ',
              parentId: item.id,
              order: nextIndex,
              isOpen: false,
              children: [],
            };

            return {
              ...item,
              children: [...item.children, newObj],
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Failed to create sibling:', error);
    }
  };

  console.log(JSON.stringify(dataList));

  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex, // Include getIndex
  }: RenderItemParams<Item>) => {
    const currentIndex = getIndex();
    const popoverRef = React.useRef();

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
            onPress={() =>
              setIsOpen((prev) => {
                const index = getIndex()!; // Get the index where you want to change the value
                // Create a new array based on the previous state
                const newBoolArr = [...prev];
                // console.log('before', newBoolArr);
                // Toggle the value at the specified index
                newBoolArr[index] = !prev[index];
                // console.log('after', newBoolArr);
                return newBoolArr; // Return the new array
              })
            }
          >
            <Ionicons
              name={
                isOpen[currentIndex!]
                  ? 'chevron-down'
                  : 'chevron-forward-outline'
              }
              size={18}
              style={{ marginRight: 12 }}
              color={'white'}
            />
          </Pressable>
        )}
        {/* Options */}
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
            {/* <Popover
              arrowSize={{ width: 0, height: 0 }}
              ref={popoverRef}
              from={
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal-outline" color="white" />
                </TouchableOpacity>
              }
            >
              <TouchableOpacity
                onPress={() => {
                  createSibling(item.parentId);
                  // popoverRef.current.requestClose();
                }}
                className="p-4"
              >
                <Text>Create tag and close</Text>
              </TouchableOpacity>
            </Popover> */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <DraggableFlatList
        data={dataList}
        onDragEnd={({ data }) => setDataList(data)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, drag, isActive, getIndex }) => (
          <View style={{ paddingLeft: 10 * level }}>
            <RenderItem
              item={item}
              drag={drag}
              isActive={isActive}
              getIndex={getIndex}
            />
            {item.children.length > 0 && isOpen[getIndex()!] && (
              <Tree
                items={item.children}
                level={level + 1}
                setItems={setItems}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

const App = () => {
  const [items, setItems] = useState<Item[]>(() => startingItems);

  // console.log('Update:', update);
  // console.log(items);

  return (
    <View className="flex flex-1 p-4">
      <Text className="text-3xl font-bold mb-4">Item Tree</Text>
      <GestureHandlerRootView>
        <Tree items={items} level={0} setItems={setItems} />
      </GestureHandlerRootView>
    </View>
  );
};

export default App;

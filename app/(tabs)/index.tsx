import React, { useState } from 'react';
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
  children: Item[];
};

const items: Item[] = [
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
};

const Tree = ({ items, level = 0 }: TreeProps) => {
  const [dataList, setDataList] = useState<Item[]>(items);
  const [isOpen, setIsOpen] = useState(() => {
    return items.map((item) => {
      return item.isOpen;
    });
  });

  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex, // Include getIndex
  }: RenderItemParams<Item>) => {
    const currentIndex = getIndex();

    return (
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        className={clsx('p-2 my-[1] flex flex-row', {
          'bg-red-500': isActive,
          'bg-blue-500': !isActive,
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
        <Text className="text-green-500">{item.title}</Text>
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
              <Tree items={item.children} level={level + 1} />
            )}
          </View>
        )}
      />
    </View>
  );
};

const App = () => {
  return (
    <View className="flex flex-1 p-4">
      <Text className="text-3xl font-bold mb-4">Item Tree</Text>
      <GestureHandlerRootView>
        <Tree items={items} level={0} />
      </GestureHandlerRootView>
    </View>
  );
};

export default App;

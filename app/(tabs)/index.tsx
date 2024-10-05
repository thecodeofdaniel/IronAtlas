import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Item = {
  id: number;
  title: string;
  parentId: number | null;
  order: number;
  children: Item[];
};

const items: Item[] = [
  {
    id: 1,
    title: 'Hello',
    parentId: null,
    order: 0,
    children: [
      {
        id: 2,
        title: 'World',
        parentId: 1,
        order: 0,
        children: [
          {
            id: 4,
            title: 'Again',
            parentId: 2,
            order: 0,
            children: [],
          },
          {
            id: 5,
            title: 'Too',
            parentId: 2,
            order: 1,
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
    children: [],
  },
];

type TreeProps = {
  items: Item[];
  level: number;
};

const Tree = ({ items, level = 0 }: TreeProps) => {
  const [dataList, setDataList] = useState<Item[]>(items);

  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex, // Include getIndex
  }: RenderItemParams<Item>) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={{
          padding: 10,
          marginVertical: 1,
          paddingLeft: 10 * level,
          backgroundColor: isActive ? 'red' : 'blue',
        }}
      >
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
            {item.children.length > 0 && (
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

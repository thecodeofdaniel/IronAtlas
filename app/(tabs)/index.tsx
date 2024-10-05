// import { View, Text, SafeAreaView } from 'react-native';

// export default function HomeScreen() {
//   return (
//     <View>
//       <Text>Home</Text>
//     </View>
//   );
// }

import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import DraggableFlatList, {
  NestableScrollContainer,
  NestableDraggableFlatList,
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';

import { mapIndexToData } from '../../utils';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Item = {
  id: number;
  title: string;
  parentId: number | null;
  order: number;
};

const items = {
  1: {
    id: 1,
    title: 'Hello',
    parentId: null,
    order: 0,
  },
  2: {
    id: 2,
    title: 'World',
    parentId: 1,
    order: 0,
  },
  3: {
    id: 3,
    title: 'Cruel',
    parentId: null,
    order: 1,
  },
};

const initialData1 = Object.values(items)
  .filter((item) => item.parentId === null) // Filter items with parentId === null
  .sort((a, b) => a.order - b.order); // Sort by order

type ItemArr = typeof initialData1;

const renderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => {
  return (
    <ScaleDecorator>
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={[styles.rowItem, { backgroundColor: isActive ? 'red' : 'blue' }]}
      >
        <Text style={styles.text}>{item.title}</Text>
      </TouchableOpacity>
    </ScaleDecorator>
  );
};

export default function Basic() {
  const [data, setData] = useState<ItemArr>(initialData1);

  const onDragEndFunc = (dataList: ItemArr) => {
    // Assuming dataList contains the objects with id, title, order, etc.
    const updatedDataList = dataList.map((data, index) => ({
      ...data, // Keep all other properties the same
      order: index, // Set the order property to match the current index
    }));
    // .sort((a, b) => a.order - b.order); // Ensure that order remains intact

    console.log(updatedDataList);
    setData(updatedDataList);
  };

  return (
    <GestureHandlerRootView>
      <DraggableFlatList
        data={data}
        onDragEnd={({ data }) => onDragEndFunc(data)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </GestureHandlerRootView>
  );
}

// function ListItem({ data, onDragEnd, keyExtractor, renderItem }: any) {
//   return (
//     <GestureHandlerRootView>
//       <DraggableFlatList
//         data={data}
//         onDragEnd={({ data }) => onDragEndFunc(data)}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderItem}
//       />
//     </GestureHandlerRootView>
//   );
// }

const styles = StyleSheet.create({
  rowItem: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

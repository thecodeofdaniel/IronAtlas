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
  children: Item[];
};

const items = [
  {
    id: 1,
    title: 'Hello',
    parentId: null,
    children: [
      {
        id: 2,
        title: 'World',
        parentId: 1,
        children: [],
      },
    ],
  },
  {
    id: 3,
    title: 'Goodbye',
    parentId: null,
    children: [],
  },
];

// const initialData1 = Object.values(items)
//   .filter((item) => item.parentId === null) // Filter items with parentId === null
//   .sort((a, b) => a.order - b.order); // Sort by order

type ItemArr = typeof items;

// One item
const RenderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => {
  return (
    <ScaleDecorator>
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={[styles.rowItem, { backgroundColor: isActive ? 'red' : 'blue' }]}
      >
        <Text style={styles.text}>
          {item.title} {item.children.length > 0 ? 'has children' : 'nah'}{' '}
        </Text>
      </TouchableOpacity>
    </ScaleDecorator>
  );
};

// export default function Basic() {
//   const [data, setData] = useState<ItemArr>(items);

//   const onDragEndFunc = (dataList: ItemArr) => {
//     // const updatedDataList = dataList.map((data, index) => ({
//     //   ...data, // Keep all other properties the same
//     //   order: index, // Set the order property to match the current index
//     // }));
//     // // .sort((a, b) => a.order - b.order); // Ensure that order remains intact

//     // console.log(updatedDataList);
//     // setData(updatedDataList);

//     setData(dataList);
//   };

//   return (
//     <GestureHandlerRootView>
//       <DraggableFlatList
//         data={data}
//         onDragEnd={({ data }) => onDragEndFunc(data)}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={RenderItem}
//       />
//     </GestureHandlerRootView>
//   );
// }

// Recursive component to render the tree
const Tree = ({ items, level = 0 }) => {
  const [data, setData] = useState(items);

  return (
    <View style={{ paddingLeft: level * 20 }}>
      {/* Indentation for each level */}
      {items.map((item) => (
        <View key={item.id} style={styles.itemContainer}>
          <Text style={styles.itemText}>{item.title}</Text>
          {/* Render children recursively if present */}
          {item.children.length > 0 && (
            <Tree items={item.children} level={level + 1} />
          )}
        </View>
      ))}
    </View>
  );
};

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Item Tree</Text>
      <Tree items={items} />
    </View>
  );
};

export default App;

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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
  },
});

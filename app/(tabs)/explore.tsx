import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Item = {
  id: number;
  title: string;
  parentId: number | null;
  order: number;
  isOpen: boolean;
  children: number[]; // Array of child ids (numbers)
};

type ItemMap = {
  [key: number]: Item;
};

const itemMap: ItemMap = {
  1: {
    id: 1,
    title: 'Hello',
    parentId: null,
    order: 0,
    isOpen: true,
    children: [2], // Only store child ids
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

// const Tree = ({ items, level = 0, setItems }: TreeProps) => {
//   const [dataList, setDataList] = useState<Item[]>(items);
//   const [isOpen, setIsOpen] = useState(() => {
//     return items.map((item) => {
//       return item.isOpen;
//     });
//   });

//   const RenderItem = ({
//     item,
//     drag,
//     isActive,
//     getIndex, // Include getIndex
//   }: RenderItemParams<Item>) => {
//     const currentIndex = getIndex();

//     return (
//       <TouchableOpacity
//         activeOpacity={1}
//         onLongPress={drag}
//         disabled={isActive}
//         className={clsx('p-2 my-[1] flex flex-row', {
//           'bg-red-500': isActive,
//           'bg-blue-800': !isActive,
//         })}
//       >
//         {item.children.length > 0 && (
//           <Pressable
//             onPress={() =>
//               setIsOpen((prev) => {
//                 const index = getIndex()!; // Get the index where you want to change the value
//                 // Create a new array based on the previous state
//                 const newBoolArr = [...prev];
//                 // console.log('before', newBoolArr);
//                 // Toggle the value at the specified index
//                 newBoolArr[index] = !prev[index];
//                 // console.log('after', newBoolArr);
//                 return newBoolArr; // Return the new array
//               })
//             }
//           >
//             <Ionicons
//               name={
//                 isOpen[currentIndex!]
//                   ? 'chevron-down'
//                   : 'chevron-forward-outline'
//               }
//               size={18}
//               style={{ marginRight: 12 }}
//               color={'white'}
//             />
//           </Pressable>
//         )}
//         {/* Options */}
//         <View className="flex flex-row items-center justify-between flex-1">
//           <Text className="text-white">{item.title}</Text>
//           <View className="flex flex-row gap-4">
//             {item.children.length === 0 ? (
//               <Ionicons name="barbell" color={'white'} />
//             ) : (
//               <Ionicons name="pricetag" color={'white'} />
//             )}
//             <TouchableOpacity onPress={() => createSibling(item.parentId)}>
//               <Ionicons name="ellipsis-horizontal-outline" color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View>
//       <DraggableFlatList
//         data={dataList}
//         onDragEnd={({ data }) => setDataList(data)}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item, drag, isActive, getIndex }) => (
//           <View style={{ paddingLeft: 10 * level }}>
//             <RenderItem
//               item={item}
//               drag={drag}
//               isActive={isActive}
//               getIndex={getIndex}
//             />
//             {item.children.length > 0 && isOpen[getIndex()!] && (
//               <Tree
//                 items={item.children}
//                 level={level + 1}
//                 setItems={setItems}
//               />
//             )}
//           </View>
//         )}
//       />
//     </View>
//   );
// };

type TreeItemProps = {
  itemId: number;
  itemMap: ItemMap;
  level: number;
};

const TreeItem = ({ itemId, itemMap, level }: TreeItemProps) => {
  const item = itemMap[itemId];

  if (!item) {
    return null;
  }

  return (
    <View style={{ paddingLeft: level * 20, marginVertical: 4 }}>
      {/* Render the current item */}
      <Text className="text-xl">{item.title}</Text>

      {/* Render FlatList of children */}
      <FlatList
        data={item.children}
        keyExtractor={(childId) => childId.toString()}
        renderItem={({ item: childId }) => (
          <TreeItem itemId={childId} itemMap={itemMap} level={level + 1} />
        )}
      />
    </View>
  );
};

export default function TabTwoScreen() {
  const [items, setItems] = useState<ItemMap>(itemMap);

  const rootItems = Object.values(items).filter(
    (item) => item.parentId === null
  );

  return (
    <View className="flex flex-1 p-4">
      <Text className="text-3xl font-bold mb-4">Item Tree</Text>
      <GestureHandlerRootView>
        {/* Render FlatList of root items */}
        <FlatList
          data={rootItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TreeItem itemId={item.id} itemMap={items} level={0} />
          )}
        />
      </GestureHandlerRootView>
    </View>
  );
}

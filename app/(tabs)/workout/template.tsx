import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import React, { Children, useState } from 'react';
import { Stack } from 'expo-router';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';

type TemplateObj = {
  exerciseId: number;
  sets: number[];
  isOpen: boolean;
  children: number[];
  parentId: number | null;
};

type TemplateMap = {
  [key: string]: TemplateObj;
};

const startingTemplateTree: TemplateMap = {
  '0': {
    exerciseId: 0,
    sets: [],
    isOpen: true,
    children: [1, 3, -1],
    parentId: null, // No parent for the root
  },
  1: {
    exerciseId: 1,
    sets: [12, 12, 12],
    isOpen: false,
    children: [],
    parentId: 0, // Set parentId
  },
  3: {
    exerciseId: 3,
    sets: [10, 8, 6],
    isOpen: false,
    children: [],
    parentId: 0, // Set parentId
  },
  '-1': {
    exerciseId: -1,
    sets: [],
    isOpen: true,
    children: [2, 4],
    parentId: 0, // Set parentId
  },
  2: {
    exerciseId: 2,
    sets: [10, 10, 10],
    isOpen: false,
    children: [],
    parentId: -1, // Set parentId
  },
  4: {
    exerciseId: 4,
    sets: [6, 8],
    isOpen: false,
    children: [],
    parentId: -1, // Set parentId
  },
};

type TemplateProps = {
  templateMap: TemplateMap;
  setTemplateMap: React.Dispatch<React.SetStateAction<TemplateMap>>;
  templateChildren: number[];
  level: number;
};

function TemplateTree({
  templateMap,
  setTemplateMap,
  templateChildren,
  level,
}: TemplateProps) {
  const RenderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<TemplateObj>) => {
    return (
      <>
        <TouchableOpacity
          onLongPress={level > 0 ? drag : undefined}
          disabled={isActive}
          activeOpacity={1}
          className={clsx('my-[1] flex flex-row items-center', {
            'bg-red-500': isActive,
            'bg-blue-800': !isActive,
          })}
        >
          {item.children.length > 0 && level > 0 && (
            <Pressable
              onPress={() => {
                setTemplateMap((prev) => ({
                  ...prev,
                  [item.exerciseId]: {
                    ...prev[item.exerciseId],
                    isOpen: !prev[item.exerciseId].isOpen,
                  },
                }));
              }}
              className="h-full flex flex-row items-center justify-center pl-[4]"
            >
              <Ionicons
                name={item.isOpen ? 'chevron-down' : 'chevron-forward-outline'}
                size={18}
                color={'white'}
              />
            </Pressable>
          )}
          <Text className="text-white">{item.exerciseId}</Text>
        </TouchableOpacity>
        {item.exerciseId > 0 && (
          <>
            <Text>Exercise Info</Text>
            {/* Add sets along with the type of set */}
            <Pressable className="bg-stone-400 border rounded-md">
              <Text className="text-white text-center">Add set</Text>
            </Pressable>
          </>
        )}
      </>
    );
  };

  const templateExercises = templateChildren.map((id) => templateMap[id]);

  return (
    <>
      <DraggableFlatList
        data={templateExercises}
        onDragEnd={({ data }) => {
          const parentId = data[0].parentId; // Get the parentId from the first item
          setTemplateMap((prev) => {
            const updatedChildren = data.map((item) => item.exerciseId); // Get the new order of children
            return {
              ...prev,
              [parentId!]: {
                // Use parentId to update the correct parent
                ...prev[parentId!],
                children: updatedChildren, // Update the children array
              },
            };
          });
        }}
        keyExtractor={(item) => item.exerciseId.toString()}
        renderItem={({ item, drag, isActive, getIndex }) => {
          return (
            <View key={item.exerciseId} style={{ paddingLeft: 5 * level }}>
              <RenderItem
                item={item}
                drag={drag}
                isActive={isActive}
                getIndex={getIndex}
              />
              {item.children.length > 0 && item.isOpen && (
                <TemplateTree
                  templateMap={templateMap}
                  setTemplateMap={setTemplateMap}
                  templateChildren={item.children}
                  level={level + 1}
                />
              )}
            </View>
          );
        }}
      />
    </>
  );
}

export default function TemplateScreen() {
  const [templateMap, setTemplateMap] = useState(startingTemplateTree);

  return (
    <>
      <Stack.Screen options={{ title: 'Template', headerShown: true }} />
      <View className="justify-between border flex-1 m-2">
        <GestureHandlerRootView>
          <TemplateTree
            templateMap={templateMap}
            setTemplateMap={setTemplateMap}
            templateChildren={[0]}
            level={0}
          />
        </GestureHandlerRootView>
        <View className="flex flex-row gap-2">
          <Pressable className="border flex-1 bg-stone-300">
            <Text className="text-center">Add group</Text>
          </Pressable>
          <Pressable className="border flex-1 bg-stone-300">
            <Text className="text-center">Add exercise</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

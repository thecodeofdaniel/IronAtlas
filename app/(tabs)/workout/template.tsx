import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import React, { Children, useState } from 'react';
import { Stack } from 'expo-router';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import {
  FlatList,
  GestureHandlerRootView,
  TextInput,
} from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';

type SettType = {
  reps: number;
  type: string;
};

type TemplateObj = {
  exerciseId: number;
  sets: SettType[];
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
    sets: [
      { reps: 12, type: 'N' },
      { reps: 12, type: 'N' },
      { reps: 12, type: 'N' },
    ],
    isOpen: false,
    children: [],
    parentId: 0, // Set parentId
  },
  3: {
    exerciseId: 3,
    sets: [
      { reps: 12, type: '' },
      { reps: 12, type: '' },
      { reps: 12, type: '' },
    ],
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
    sets: [
      { reps: 12, type: '' },
      { reps: 12, type: '' },
      { reps: 12, type: '' },
    ],
    isOpen: false,
    children: [],
    parentId: -1, // Set parentId
  },
  4: {
    exerciseId: 4,
    sets: [
      { reps: 12, type: '' },
      { reps: 12, type: '' },
    ],
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
  const RenderExerciseOrGroup = ({
    item: group,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<TemplateObj>) => {
    const RenderSet = ({ reps, type }: SettType) => {
      const [text, setText] = useState(`${reps}${type}`);

      return (
        <View className="my-1 mr-1 flex flex-row gap-1">
          {/* <Text>{reps}</Text>
        <Text>{type}</Text> */}
          <TextInput value={text} onChangeText={(text) => setText(text)} />
        </View>
      );
    };

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
          {group.children.length > 0 && level > 0 && (
            <Pressable
              onPress={() => {
                setTemplateMap((prev) => ({
                  ...prev,
                  [group.exerciseId]: {
                    ...prev[group.exerciseId],
                    isOpen: !prev[group.exerciseId].isOpen,
                  },
                }));
              }}
              className="flex h-full flex-row items-center justify-center pl-[4]"
            >
              <Ionicons
                name={group.isOpen ? 'chevron-down' : 'chevron-forward-outline'}
                size={18}
                color={'white'}
              />
            </Pressable>
          )}
          <Text className="text-white">{group.exerciseId}</Text>
        </TouchableOpacity>
        {group.exerciseId > 0 && (
          <>
            <Text>Exercise Info</Text>
            {/* <FlatList
              horizontal
              data={group.sets}
              keyExtractor={(item, index) =>
                `${group.exerciseId}-${index}-${item.reps}`
              }
              renderItem={({ item }) => (
                <RenderSet reps={item.reps} type={item.type} />
              )}
            /> */}
            <Pressable className="rounded-md border bg-stone-400">
              <Text className="text-center text-white">Add set</Text>
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
              <RenderExerciseOrGroup
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
      <View className="m-2 flex-1 justify-between border">
        <GestureHandlerRootView>
          <TemplateTree
            templateMap={templateMap}
            setTemplateMap={setTemplateMap}
            templateChildren={[0]}
            level={0}
          />
        </GestureHandlerRootView>
        <View className="flex flex-row gap-2">
          <Pressable className="flex-1 border bg-stone-300">
            <Text className="text-center">Add group</Text>
          </Pressable>
          <Pressable className="flex-1 border bg-stone-300">
            <Text className="text-center">Add exercise</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

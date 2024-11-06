import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import React, { Children, useState } from 'react';
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
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { useExerciseStore } from '@/store/exercise/exerciseStore';

type TemplateProps = {
  templateMap: TemplateMap;
  exerciseMap: ExerciseMap;
  reorderTemplate: (templateObjs: TemplateObj[]) => void;
  templateChildren: string[];
  level: number;
};

function TemplateTree({
  templateMap,
  exerciseMap,
  reorderTemplate,
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

    if (group.parentId === null) {
      return null;
    }

    return (
      <>
        <TouchableOpacity
          onLongPress={level > 0 ? drag : undefined}
          disabled={isActive}
          activeOpacity={1}
          className={clsx('my-[1] flex flex-row items-center p-2', {
            'bg-red-500': isActive,
            'bg-blue-800': !isActive,
          })}
        >
          <Text className="text-white">
            {exerciseMap[group.exerciseId].label}
          </Text>
        </TouchableOpacity>
        {/* {group.exerciseId > 0 && (
          <>
            <Text>Exercise Info</Text>
            <FlatList
              horizontal
              data={group.sets}
              keyExtractor={(item, index) =>
                `${group.exerciseId}-${index}-${item.reps}`
              }
              renderItem={({ item }) => (
                <RenderSet reps={item.reps} type={item.type} />
              )}
            />
            <Pressable className="rounded-md border bg-stone-400">
              <Text className="text-center text-white">Add set</Text>
            </Pressable>
          </>
        )} */}
      </>
    );
  };

  const templateExercises = templateChildren.map((id) => templateMap[id]);

  return (
    <>
      <DraggableFlatList
        data={templateExercises}
        onDragEnd={({ data }) => reorderTemplate(data)}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item, drag, isActive, getIndex }) => {
          return (
            <View key={item.exerciseId} style={{ paddingLeft: 5 * level }}>
              <RenderExerciseOrGroup
                item={item}
                drag={drag}
                isActive={isActive}
                getIndex={getIndex}
              />
              {item.children.length > 0 && (
                <TemplateTree
                  templateMap={templateMap}
                  exerciseMap={exerciseMap}
                  reorderTemplate={reorderTemplate}
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
  const [templateMap, setTemplateMap] = useState({});
  const { template, reorderTemplate } = useWorkoutStore((state) => state);
  const { exerciseMap } = useExerciseStore((state) => state);

  console.log('Template:', template);

  return (
    <>
      <View className="flex-1 justify-between border">
        <GestureHandlerRootView>
          <TemplateTree
            templateMap={template}
            exerciseMap={exerciseMap}
            reorderTemplate={reorderTemplate}
            templateChildren={['0']}
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

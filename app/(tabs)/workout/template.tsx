import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import React, { Children, useRef, useState } from 'react';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
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

import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from 'react-native-swipeable-item';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

type TemplateProps = {
  templateMap: TemplateMap;
  exerciseMap: ExerciseMap;
  reorderTemplate: (templateObjs: TemplateObj[]) => void;
  templateChildren: string[];
  level: number;
};

type RowItemProps = {
  drag: () => void;
  getIndex: () => number | undefined;
  isActive: boolean;
  item: TemplateObj;
  itemRefs: React.MutableRefObject<Map<any, any>>;
};

function RowItem({ drag, getIndex, isActive, item, itemRefs }: RowItemProps) {
  const exerciseMap = useExerciseStore((state) => state.exerciseMap);

  return (
    <>
      <ScaleDecorator>
        <SwipeableItem
          key={item.uuid}
          item={item}
          ref={(ref) => {
            if (ref && !itemRefs.current.get(item.uuid)) {
              itemRefs.current.set(item.uuid, ref);
            }
          }}
          onChange={({ openDirection }) => {
            if (openDirection !== OpenDirection.NONE) {
              [...itemRefs.current.entries()].forEach(([key, ref]) => {
                if (key !== item.uuid && ref) ref.close();
              });
            }
          }}
          overSwipe={20}
          snapPointsLeft={[100]}
          renderUnderlayLeft={() => (
            <UnderlayLeft drag={drag} onPressDelete={() => {}} />
          )}
        >
          <TouchableOpacity
            // onLongPress={level > 0 ? drag : undefined}
            onLongPress={drag}
            disabled={isActive}
            activeOpacity={1}
            className={clsx('my-[1] flex flex-row items-center p-2', {
              'bg-red-500': isActive,
              'bg-blue-800': !isActive,
            })}
          >
            <Text className="text-white">
              {item.exerciseId === null
                ? 'Superset'
                : exerciseMap[item.exerciseId].label}
            </Text>
          </TouchableOpacity>
        </SwipeableItem>
      </ScaleDecorator>
    </>
  );
}

const UnderlayLeft = ({
  drag,
  onPressDelete,
}: {
  drag: () => void;
  onPressDelete: () => void;
}) => {
  const { item, percentOpen } = useSwipeableItemParams<TemplateObj>();
  const animStyle = useAnimatedStyle(
    () => ({
      opacity: percentOpen.value,
    }),
    [percentOpen],
  );

  return (
    <Animated.View
      // style={[styles.row, styles.underlayLeft, animStyle]} // Fade in on open
      style={[animStyle]}
      className="flex-1 flex-row items-center justify-end bg-red-500 pr-4"
    >
      <TouchableOpacity onPress={onPressDelete}>
        <Text className="text-2xl font-bold text-white">Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

function TemplateTree({
  templateMap,
  exerciseMap,
  reorderTemplate,
  templateChildren,
  level,
}: TemplateProps) {
  // const RenderItem = ({
  //   item: group,
  //   drag,
  //   isActive,
  //   getIndex,
  // }: RenderItemParams<TemplateObj>) => {
  //   const RenderSet = ({ reps, type }: SettType) => {
  //     const [text, setText] = useState(`${reps}${type}`);

  //     return (
  //       <View className="my-1 mr-1 flex flex-row gap-1">
  //         {/* <Text>{reps}</Text>
  //       <Text>{type}</Text> */}
  //         <TextInput value={text} onChangeText={(text) => setText(text)} />
  //       </View>
  //     );
  //   };

  //   if (group.parentId === null) {
  //     return null;
  //   }

  //   const itemRefs = useRef(new Map());

  //   return (
  //     <>
  //       <TouchableOpacity
  //         onLongPress={level > 0 ? drag : undefined}
  //         disabled={isActive}
  //         activeOpacity={1}
  //         className={clsx('my-[1] flex flex-row items-center p-2', {
  //           'bg-red-500': isActive,
  //           'bg-blue-800': !isActive,
  //         })}
  //       >
  //         <Text className="text-white">
  //           {exerciseMap[group.exerciseId].label}
  //         </Text>
  //       </TouchableOpacity>
  //       {/* {group.exerciseId > 0 && (
  //         <>
  //           <Text>Exercise Info</Text>
  //           <FlatList
  //             horizontal
  //             data={group.sets}
  //             keyExtractor={(item, index) =>
  //               `${group.exerciseId}-${index}-${item.reps}`
  //             }
  //             renderItem={({ item }) => (
  //               <RenderSet reps={item.reps} type={item.type} />
  //             )}
  //           />
  //           <Pressable className="rounded-md border bg-stone-400">
  //             <Text className="text-center text-white">Add set</Text>
  //           </Pressable>
  //         </>
  //       )} */}
  //     </>
  //   );
  // };

  const RenderItem = (params: RenderItemParams<TemplateObj>) => {
    const { item: item, isActive, drag } = params;

    if (item.parentId === null) {
      return null;
    }

    const itemRefs = useRef(new Map());

    // return (
    //   <>
    //     <TouchableOpacity
    //       onLongPress={level > 0 ? drag : undefined}
    //       disabled={isActive}
    //       activeOpacity={1}
    //       className={clsx('my-[1] flex flex-row items-center p-2', {
    //         'bg-red-500': isActive,
    //         'bg-blue-800': !isActive,
    //       })}
    //     >
    //       <Text className="text-white">
    //         {exerciseMap[group.exerciseId].label}
    //       </Text>
    //     </TouchableOpacity>
    //   </>
    // );

    // return (
    //   <View key={item.exerciseId} style={{ paddingLeft: 5 * level }}>
    //     <RowItem {...params} itemRefs={itemRefs} />
    //     {item.children.length > 0 && (
    //       <TemplateTree
    //         templateMap={templateMap}
    //         exerciseMap={exerciseMap}
    //         reorderTemplate={reorderTemplate}
    //         templateChildren={item.children}
    //         level={level + 1}
    //       />
    //     )}
    //   </View>
    // );

    return <RowItem {...params} itemRefs={itemRefs} />;
  };

  const templateExercises = templateChildren.map((id) => templateMap[id]);

  console.log(`${level}: ${JSON.stringify(templateExercises)}`);

  return (
    <>
      <DraggableFlatList
        data={templateExercises}
        onDragEnd={({ data }) => reorderTemplate(data)}
        keyExtractor={(item) => item.uuid}
        // renderItem={RenderItem}
        // renderItem={({ item, drag, isActive, getIndex }) => {
        //   return (
        //     <View key={item.exerciseId} style={{ paddingLeft: 5 * level }}>
        //       <RenderItem
        //         item={item}
        //         drag={drag}
        //         isActive={isActive}
        //         getIndex={getIndex}
        //       />
        //       {item.children.length > 0 && (
        //         <TemplateTree
        //           templateMap={templateMap}
        //           exerciseMap={exerciseMap}
        //           reorderTemplate={reorderTemplate}
        //           templateChildren={item.children}
        //           level={level + 1}
        //         />
        //       )}
        //     </View>
        //   );
        // }}
        renderItem={(params) => {
          return (
            <View style={{ paddingLeft: 5 * level }}>
              <RenderItem {...params} />
              {params.item.children.length > 0 && (
                <TemplateTree
                  templateMap={templateMap}
                  exerciseMap={exerciseMap}
                  reorderTemplate={reorderTemplate}
                  templateChildren={params.item.children}
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

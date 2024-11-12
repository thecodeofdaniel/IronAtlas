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
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useModalStore } from '@/store/modalStore';
import { Link, useRouter } from 'expo-router';

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
  const deleteFromTemplate = useWorkoutStore((state) => state.deleteExercise);
  const { showActionSheetWithOptions } = useActionSheet();
  const isSuperset = item.children.length > 0;
  const openModal = useModalStore((state) => state.openModal);
  const router = useRouter();

  const handleOnPress = () => {
    const options = ['Add exercise to superset', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            openModal('selectExercises', {
              isSuperset: isSuperset,
              uuid: item.uuid,
            });
            router.push('/modal');
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  return (
    <>
      <ScaleDecorator activeScale={1}>
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
            <UnderlayLeft
              drag={drag}
              onPressDelete={() => deleteFromTemplate(item.uuid)}
            />
          )}
        >
          <Link
            href={{
              pathname: '/(tabs)/workout/[uuid]',
              params: { uuid: item.uuid },
            }}
            asChild
          >
            <TouchableOpacity
              // onLongPress={level > 0 ? drag : undefined}
              onLongPress={drag}
              disabled={isActive}
              activeOpacity={1}
              className={clsx('my-[1] flex flex-row items-center', {
                'bg-red-500': isActive,
                'bg-blue-800': !isActive,
              })}
            >
              <View className="flex flex-1 flex-row items-center justify-between">
                <Text className="pl-2 text-white">
                  {item.exerciseId === null
                    ? 'Superset'
                    : exerciseMap[item.exerciseId].label}
                </Text>
                <Ionicons
                  name="add"
                  size={24}
                  color={'white'}
                  style={{
                    // borderColor: 'white', borderWidth: 2,
                    padding: 4,
                    opacity: isSuperset ? 1 : 0,
                  }}
                  onPress={isSuperset ? handleOnPress : () => {}}
                />
              </View>
            </TouchableOpacity>
          </Link>
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
      style={[animStyle]}
      className="my-[1] flex-1 flex-row items-center justify-end bg-red-500 pr-4"
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
  const RenderItem = (params: RenderItemParams<TemplateObj>) => {
    const itemRefs = useRef(new Map());
    return <RowItem {...params} itemRefs={itemRefs} />;
  };

  const templateExercises = templateChildren.map((id) => templateMap[id]);

  return (
    <>
      <DraggableFlatList
        data={templateExercises}
        onDragEnd={({ data }) => reorderTemplate(data)}
        keyExtractor={(item) => item.uuid}
        renderItem={(params) => {
          return (
            <View style={{ paddingLeft: 10 * level }}>
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
  const { template, reorderTemplate } = useWorkoutStore((state) => state);
  const { exerciseMap } = useExerciseStore((state) => state);

  return (
    <>
      <GestureHandlerRootView
        style={{ borderColor: 'black', borderWidth: 1, flex: 1 }}
      >
        <TemplateTree
          templateMap={template}
          exerciseMap={exerciseMap}
          reorderTemplate={reorderTemplate}
          templateChildren={template[0].children}
          level={0}
        />
      </GestureHandlerRootView>
    </>
  );
}

import { useModalStore } from '@/store/modalStore';
import {
  useWorkoutStore,
  WorkoutStateFunctions,
} from '@/store/workout/workoutStore';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from 'react-native-swipeable-item';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UnderlayLeft from './UnderLayLeft';
import clsx from 'clsx';
import SupersetOptions from './SupersetOptions';
import SupersetAddIcon from './SupersetAddIcon';

type RowItemProps = {
  drag: () => void;
  getIndex: () => number | undefined;
  isActive: boolean;
  item: TemplateObj;
  actions: WorkoutStateFunctions;
  exerciseMap: ExerciseMap;
  itemRefs: React.MutableRefObject<Map<any, any>>;
};

export default function RowItem({
  drag,
  getIndex,
  isActive,
  item,
  actions,
  exerciseMap,
  itemRefs,
}: RowItemProps) {
  const isSuperset = item.children.length > 0;

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
              onPressDelete={() => actions.deleteExercise(item.uuid)}
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
                {isSuperset ? (
                  <SupersetOptions uuid={item.uuid} isSuperset={true} />
                ) : (
                  <SupersetAddIcon isSuperset={false} />
                )}
              </View>
            </TouchableOpacity>
          </Link>
        </SwipeableItem>
      </ScaleDecorator>
    </>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from 'react-native-swipeable-item';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { generateId } from '@/utils/utils';
import {
  GestureHandlerRootView,
  ScrollView,
  TextInput,
} from 'react-native-gesture-handler';
import clsx from 'clsx';
import PopoverSetType from '@/components/SetsTable/PopoverSetType';
import { setsTableStyles as styles } from './setsTableStyles';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import SettTypeButton from './SettTypeButton';
import SetTableRow from './SetTableRow';
import SetsTableFooter from './SetsTableFooter';
import SetsTableHeader from './SetsTableHeader';

const OVERSWIPE_DIST = 20;

type Props = {
  title: string;
  uuid: string;
  superSetLength: number;
  index: number | null;
  setIndex: React.Dispatch<React.SetStateAction<number | null>>;
};

export default function SetsTable({
  title,
  uuid,
  superSetLength,
  index,
  setIndex,
}: Props) {
  // console.log('Render SetsTable');
  const itemRefs = useRef(new Map());
  const { template, reorderSets, editSet } = useWorkoutStore((state) => state);

  const renderItem = (params: RenderItemParams<SettType>) => {
    const onPressDelete = () => {
      const newSets = template[uuid].sets.filter(
        (set) => set.key !== params.item.key,
      );
      reorderSets(uuid, newSets);
    };

    return (
      <SetTableRow
        {...params}
        itemRefs={itemRefs}
        uuid={uuid}
        editSet={editSet}
        onPressDelete={onPressDelete}
      />
    );
  };

  return (
    // <View>
    <GestureHandlerRootView
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <DraggableFlatList
        keyExtractor={(item) => item.key.toString()}
        data={template[uuid].sets}
        renderItem={renderItem}
        onDragEnd={({ data }) => {
          reorderSets(uuid, data);
        }}
        activationDistance={20}
        ListHeaderComponent={() => <SetsTableHeader uuid={uuid} />}
        ListFooterComponent={() => (
          <SetsTableFooter
            uuid={uuid}
            superSetLength={superSetLength}
            setIndex={setIndex}
            index={index}
          />
        )}
      />
    </GestureHandlerRootView>
    // </View>
  );
}

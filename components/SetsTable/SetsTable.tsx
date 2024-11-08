import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from 'react-native-swipeable-item';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { generateId } from '@/utils/utils';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import clsx from 'clsx';
import PopoverSetType from '@/components/SetsTable/PopoverSetType';
import { setsTableStyles as styles } from './setsTableStyles';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const OVERSWIPE_DIST = 20;

export default function TrackExercise({
  title,
  uuid,
}: {
  title: string;
  uuid: string;
}) {
  const itemRefs = useRef(new Map());
  const { template, addSet, reorderSets, editSet } = useWorkoutStore(
    (state) => state,
  );

  const renderItem = (params: RenderItemParams<SettType>) => {
    const onPressDelete = () => {
      const newSets = template[uuid].sets.filter(
        (set) => set.key !== params.item.key,
      );
      reorderSets(uuid, newSets);
    };

    return (
      <RowItem
        {...params}
        itemRefs={itemRefs}
        uuid={uuid}
        editSet={editSet}
        onPressDelete={onPressDelete}
      />
    );
  };

  // Footer component that includes the Add Set button
  const renderFooter = () => {
    return (
      <Pressable
        onPress={() => addSet(uuid)}
        style={styles.shadow}
        className="mb-10 mt-2 rounded-md bg-red-500 p-4"
      >
        <Text className="text-center text-xl font-medium text-white shadow-lg">
          Add set
        </Text>
      </Pressable>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          style={{ maxWidth: '100%' }}
        >
          <View className="mb-2 flex flex-row items-center">
            {/* <Link
              href={'../'}
              asChild
              // style={{ borderWidth: 2, borderColor: 'black' }}
            >
              <Ionicons name="chevron-back" size={32} style={{padding: 0}} />
            </Link> */}
            <Text className="text-4xl font-bold text-stone-700">{title}</Text>
          </View>
        </ScrollView>
        <View className="flex flex-row justify-between rounded-t-lg bg-stone-600 p-2">
          <Text
            style={[styles.setWidth, styles.headerFontSize]}
            className="font-medium text-white"
          >
            Type
          </Text>
          <Text
            style={[styles.setWidth, styles.headerFontSize]}
            className="font-medium text-white"
          >
            Weight
          </Text>
          <Text
            style={[styles.setWidth, styles.headerFontSize]}
            className="font-medium text-white"
          >
            Reps
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerBackTitle: 'Back' }} />
      <DraggableFlatList
        keyExtractor={(item) => item.key.toString()}
        data={template[uuid].sets}
        renderItem={renderItem}
        onDragEnd={({ data }) => {
          reorderSets(uuid, data);
        }}
        activationDistance={20}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        // style={{ borderColor: 'red', borderWidth: 2 }}
      />
    </>
  );
}

type RowItemProps = {
  drag: () => void;
  getIndex: () => number | undefined;
  item: SettType;
  itemRefs: React.MutableRefObject<Map<any, any>>;
  uuid: string;
  editSet: (uuid: string, index: number, newSet: SettType) => void;
  onPressDelete: () => void;
};

function RowItem({
  drag,
  getIndex,
  item,
  itemRefs,
  uuid,
  editSet,
  onPressDelete,
}: RowItemProps) {
  const index = getIndex()!;

  return (
    <>
      <ScaleDecorator>
        <SwipeableItem
          key={item.key}
          item={item}
          ref={(ref) => {
            if (ref && !itemRefs.current.get(item.key)) {
              itemRefs.current.set(item.key, ref);
            }
          }}
          onChange={({ openDirection }) => {
            if (openDirection !== OpenDirection.NONE) {
              [...itemRefs.current.entries()].forEach(([key, ref]) => {
                if (key !== item.key && ref) ref.close();
              });
            }
          }}
          overSwipe={OVERSWIPE_DIST}
          renderUnderlayLeft={() => (
            <UnderlayLeft drag={drag} onPressDelete={onPressDelete} />
          )}
          snapPointsLeft={[100]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={drag}
            className={clsx(
              'flex flex-1 flex-row items-center justify-center bg-stone-500 p-2',
            )}
          >
            <View className="flex flex-1 flex-row justify-between">
              <PopoverSetType
                uuid={uuid}
                item={item}
                index={index}
                editSet={editSet}
              />
              <TextInput
                value={item.weight}
                keyboardType="numeric"
                returnKeyType="done"
                style={[styles.weightWidth, styles.infoFontSize]}
                className="rounded bg-stone-600 p-1 text-white"
                onChangeText={(text) =>
                  editSet(uuid, index, { ...item, weight: text })
                }
              />
              <TextInput
                value={item.reps}
                keyboardType="numeric"
                returnKeyType="done"
                style={[styles.weightWidth, styles.infoFontSize]}
                className="rounded bg-stone-600 p-1 text-white"
                onChangeText={(text) =>
                  editSet(uuid, index, { ...item, reps: text })
                }
              />
            </View>
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
  const { item, percentOpen } = useSwipeableItemParams<SettType>();
  const animStyle = useAnimatedStyle(
    () => ({
      opacity: percentOpen.value,
    }),
    [percentOpen],
  );

  return (
    <Animated.View
      style={[animStyle]}
      className="flex-1 flex-row items-center justify-end bg-red-500 pr-4"
    >
      <TouchableOpacity onPress={onPressDelete}>
        <Text className="text-2xl font-bold text-white">Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

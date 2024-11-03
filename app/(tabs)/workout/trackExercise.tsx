import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Button,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  FadeIn,
  Layout,
  PinwheelOut,
} from 'react-native-reanimated';
import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from 'react-native-swipeable-item';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
// const { multiply, sub } = Animated;
import { generateId } from '@/utils/utils';
import {
  GestureHandlerRootView,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import PopoverSetType from '@/components/PopoverSetType';

const OVERSWIPE_DIST = 20;

type Sett = {
  key: string;
  weight: string;
  reps: string;
  rpe: string;
  type: string;
};

const initialSetData = [
  { key: generateId(), weight: '225', reps: '6', rpe: '8', type: 'N' },
  { key: generateId(), weight: '225', reps: '4', rpe: '8', type: 'N' },
  { key: generateId(), weight: '225', reps: '4', rpe: '8', type: 'N' },
];

export default function TrackExercise() {
  console.log('Render TrackExercise');
  const [data, setData] = useState<Sett[]>(initialSetData);
  const itemRefs = useRef(new Map());

  const renderItem = (params: RenderItemParams<Sett>) => {
    const onPressDelete = () => {
      setData((prev) => prev.filter((item) => item !== params.item));
    };

    return (
      <RowItem
        {...params}
        setData={setData}
        itemRefs={itemRefs}
        onPressDelete={onPressDelete}
      />
    );
  };

  const handleAddSet = () => {
    setData((prev) => {
      const lastElemIdx = prev.length - 1;

      return [
        ...prev,
        {
          key: generateId(),
          weight: prev[lastElemIdx].weight,
          reps: '',
          rpe: '',
          type: 'N',
        },
      ];
    });
  };

  // Footer component that includes the Add Set button
  const renderFooter = () => {
    return (
      <Pressable
        onPress={handleAddSet}
        style={styles.shadow}
        className="mb-10 mt-2 rounded-md bg-red-500 p-4"
      >
        <Text className="text-center text-xl font-medium text-white shadow-lg">
          Add set
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      {/* <SafeAreaView style={{ borderWidth: 2, borderColor: 'black', flex: 1 }}> */}
      <View className="flex flex-row justify-between rounded-t-lg bg-stone-600 p-2">
        <Text style={styles.setWidth} className="font-medium text-white">
          Type
        </Text>
        <Text style={styles.weightWidth} className="font-medium text-white">
          Weight
        </Text>
        <Text style={styles.repsWidth} className="font-medium text-white">
          Reps
        </Text>
        <Text style={styles.rpeWidth} className="font-medium text-white">
          RPE
        </Text>
      </View>
      <DraggableFlatList
        keyExtractor={(item) => item.key}
        data={data}
        renderItem={renderItem}
        onDragEnd={({ data }) => {
          setData(data);
        }}
        activationDistance={20}
        ListFooterComponent={renderFooter}
        // contentContainerStyle={{ flexGrow: 1 }}
        // style={{ flex: 1 }}
      />
      {/* </SafeAreaView> */}
    </>
  );
}

type RowItemProps = {
  drag: () => void;
  getIndex: () => number | undefined;
  item: Sett;
  setData: React.Dispatch<React.SetStateAction<Sett[]>>;
  itemRefs: React.MutableRefObject<Map<any, any>>;
  onPressDelete: () => void;
};

function RowItem({
  drag,
  getIndex,
  item,
  setData,
  itemRefs,
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
              <PopoverSetType item={item} setData={setData} />
              <TextInput
                value={item.weight}
                keyboardType="numeric"
                returnKeyType="done"
                style={styles.weightWidth}
                className="rounded bg-stone-600 text-white"
                onChangeText={(text) => {
                  setData((prev) => {
                    return prev.map((i) =>
                      i.key === item.key ? { ...item, weight: text } : i,
                    );
                  });
                }}
              />
              <TextInput
                value={item.reps}
                keyboardType="numeric"
                returnKeyType="done"
                style={styles.repsWidth}
                className="rounded bg-stone-600 text-white"
                onChangeText={(text) => {
                  setData((prev) => {
                    return prev.map((i) =>
                      i.key === item.key ? { ...item, reps: text } : i,
                    );
                  });
                }}
              />
              <TextInput
                value={item.rpe}
                keyboardType="numeric"
                returnKeyType="done"
                style={styles.rpeWidth}
                className="rounded bg-stone-600 text-white"
                onChangeText={(text) => {
                  setData((prev) => {
                    return prev.map((i) =>
                      i.key === item.key ? { ...item, rpe: text } : i,
                    );
                  });
                }}
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
  const { item, percentOpen } = useSwipeableItemParams<Sett>();
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

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    // shadowRadius: 3.84,
  },
  setWidth: {
    width: 42,
    textAlign: 'center',
    // borderWidth: 2,
    // borderColor: 'blue',
  },
  weightWidth: {
    width: 52,
    textAlign: 'center',
    // borderWidth: 2,
    // borderColor: 'blue',
  },
  repsWidth: {
    width: 52,
    textAlign: 'center',
    // borderWidth: 2,
    // borderColor: 'blue',
  },
  rpeWidth: {
    width: 36,
    textAlign: 'center',
    // borderWidth: 2,
    // borderColor: 'blue',
  },
});

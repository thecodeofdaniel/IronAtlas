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
import { mapIndexToData, Item } from './utils';
import { generateId } from '@/utils/utils';
import {
  GestureHandlerRootView,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import Popover, { PopoverPlacement } from 'react-native-popover-view';

const OVERSWIPE_DIST = 20;
const NUM_ITEMS = 20;

const initialData: Item[] = [...Array(NUM_ITEMS)].fill(0).map(mapIndexToData);

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
        className="p-4 bg-red-500 rounded-md mt-2 mb-10"
      >
        <Text className="text-white text-center font-medium text-xl shadow-lg">
          Add set
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      {/* <SafeAreaView style={{ borderWidth: 2, borderColor: 'black', flex: 1 }}> */}
      <View className="flex flex-row justify-between bg-stone-600 p-2 rounded-t-lg">
        <Text style={styles.setWidth} className="text-white font-medium">
          Type
        </Text>
        <Text style={styles.weightWidth} className="text-white font-medium">
          Weight
        </Text>
        <Text style={styles.repsWidth} className="text-white font-medium">
          Reps
        </Text>
        <Text style={styles.rpeWidth} className="text-white font-medium">
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

  const [showPopover, setShowPopover] = useState(false);

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
              'flex flex-row flex-1 items-center justify-center bg-stone-500 p-2'
            )}
          >
            <View className="flex flex-row justify-between flex-1">
              {/* <TextInput
                value={`${index + 1}`}
                returnKeyType="done"
                style={styles.setWidth}
                className="bg-stone-600 rounded text-white h-8"
              /> */}
              <Popover
                placement={PopoverPlacement.BOTTOM}
                isVisible={showPopover}
                onRequestClose={() => setShowPopover(false)} // if the user clicks outside popover
                from={
                  <TouchableOpacity
                    style={styles.setWidth}
                    className="bg-stone-600"
                    onPress={() => setShowPopover(true)}
                  >
                    <Text
                      className={clsx('text-white text-center', {
                        'text-yellow-500': item.type === 'W',
                        'text-purple-500': item.type === 'D',
                        'text-red-500': item.type === 'F',
                      })}
                    >
                      {item.type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                }
              >
                <View className="p-2 flex flex-col gap-1">
                  <Pressable
                    className="bg-yellow-500 px-4 py-2"
                    onPress={() => {
                      setData((prev) => {
                        return prev.map((i) =>
                          i.key === item.key ? { ...item, type: 'W' } : i
                        );
                      });
                      setShowPopover(false);
                    }}
                  >
                    <Text className="text-yellow-900 text-center">Warmup</Text>
                  </Pressable>
                  <Pressable
                    className="bg-stone-500 px-4 py-2"
                    onPress={() => {
                      setData((prev) => {
                        return prev.map((i) =>
                          i.key === item.key ? { ...item, type: 'N' } : i
                        );
                      });
                      setShowPopover(false);
                    }}
                  >
                    <Text className="text-white text-center">Normal</Text>
                  </Pressable>
                  <Pressable
                    className="bg-purple-500 px-4 py-2"
                    onPress={() => {
                      setData((prev) => {
                        return prev.map((i) =>
                          i.key === item.key ? { ...item, type: 'D' } : i
                        );
                      });
                      setShowPopover(false);
                    }}
                  >
                    <Text className="text-purple-900 text-center">Dropset</Text>
                  </Pressable>
                  <Pressable
                    className="bg-red-500 px-4 py-2"
                    onPress={() => {
                      setData((prev) => {
                        return prev.map((i) =>
                          i.key === item.key ? { ...item, type: 'F' } : i
                        );
                      });
                      setShowPopover(false);
                    }}
                  >
                    <Text className="text-red-900 text-center">Failure</Text>
                  </Pressable>
                </View>
              </Popover>
              <TextInput
                value={item.weight}
                keyboardType="numeric"
                returnKeyType="done"
                style={styles.weightWidth}
                className="bg-stone-600 rounded text-white"
                onChangeText={(text) => {
                  setData((prev) => {
                    return prev.map((i) =>
                      i.key === item.key ? { ...item, weight: text } : i
                    );
                  });
                }}
              />
              <TextInput
                value={item.reps}
                keyboardType="numeric"
                returnKeyType="done"
                style={styles.repsWidth}
                className="bg-stone-600 rounded text-white"
                onChangeText={(text) => {
                  setData((prev) => {
                    return prev.map((i) =>
                      i.key === item.key ? { ...item, reps: text } : i
                    );
                  });
                }}
              />
              <TextInput
                value={item.rpe}
                keyboardType="numeric"
                returnKeyType="done"
                style={styles.rpeWidth}
                className="bg-stone-600 rounded text-white"
                onChangeText={(text) => {
                  setData((prev) => {
                    return prev.map((i) =>
                      i.key === item.key ? { ...item, rpe: text } : i
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
  const { item, percentOpen } = useSwipeableItemParams<Item>();
  const animStyle = useAnimatedStyle(
    () => ({
      opacity: percentOpen.value,
    }),
    [percentOpen]
  );

  return (
    <Animated.View
      // style={[styles.row, styles.underlayLeft, animStyle]} // Fade in on open
      style={[animStyle]}
      className="bg-red-500 flex-1 justify-end flex-row items-center pr-4"
    >
      <TouchableOpacity onPress={onPressDelete}>
        <Text className="font-bold text-white text-2xl">Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 32,
  },
  underlayRight: {
    flex: 1,
    backgroundColor: 'teal',
    justifyContent: 'flex-start',
  },
  underlayLeft: {
    flex: 1,
    backgroundColor: 'tomato',
    justifyContent: 'flex-end',
  },
  shadow: {
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset of the shadow
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.84, // Blur radius of the shadow
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

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
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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
  console.log('Render trackExercise');
  // const [data, setData] = useState(initialData);
  const [data, setData] = useState<Sett[]>(initialSetData);
  const itemRefs = useRef(new Map());

  // const renderItem = useCallback((params: RenderItemParams<Sett>) => {
  //   const onPressDelete = () => {
  //     setData((prev) => {
  //       return prev.filter((item) => item !== params.item);
  //     });
  //   };

  //   return (
  //     <RowItem
  //       {...params}
  //       index={params.getIndex()!}
  //       setData={setData}
  //       itemRefs={itemRefs}
  //       onPressDelete={onPressDelete}
  //     />
  //   );
  // }, []);

  const renderItem = (params: RenderItemParams<Sett>) => {
    const onPressDelete = () => {
      setData((prev) => {
        return prev.filter((item) => item !== params.item);
      });
    };

    return (
      <RowItem
        {...params}
        index={params.getIndex()!}
        setData={setData}
        itemRefs={itemRefs}
        onPressDelete={onPressDelete}
      />
    );
  };

  const handleAddSet = () => {
    console.log('pressed');
    setData((prev) => {
      return [
        ...prev,
        {
          key: generateId(),
          weight: '',
          reps: '',
          rpe: '',
          type: 'normal',
        },
      ];
    });
  };

  return (
    <>
      <DraggableFlatList
        keyExtractor={(item) => item.key}
        data={data}
        renderItem={renderItem}
        onDragEnd={({ data }) => setData(data)}
        activationDistance={20}
      />
      <Pressable
        className="border bg-orange-400 p-4 z-90"
        onPress={handleAddSet}
      >
        <Text className="text-center text-white">Add set</Text>
      </Pressable>
    </>
  );
}

type RowItemProps = {
  item: Sett;
  index: number;
  setData: React.Dispatch<React.SetStateAction<Sett[]>>;
  getIndex: () => number | undefined;
  drag: () => void;
  onPressDelete: () => void;
  itemRefs: React.MutableRefObject<Map<any, any>>;
};

function RowItem({
  item,
  setData,
  itemRefs,
  getIndex,
  drag,
  onPressDelete,
}: RowItemProps) {
  // const [snapPointsLeft, setSnapPointsLeft] = useState([150]);
  const index = getIndex()!;

  // useEffect(() => {
  //   if (item.key === 'key-0') {
  //     setTimeout(() => {
  //       itemRefs.current
  //         ?.get(item.key)
  //         ?.open(OpenDirection.LEFT, undefined, { animated: true });
  //     }, 1000);
  //   }
  // }, [item.key]);

  return (
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
            // Close all other open items
            [...itemRefs.current.entries()].forEach(([key, ref]) => {
              if (key !== item.key && ref) ref.close();
            });
          }
        }}
        overSwipe={OVERSWIPE_DIST}
        renderUnderlayLeft={() => (
          <UnderlayLeft drag={drag} onPressDelete={onPressDelete} />
        )}
        // renderUnderlayRight={() => <UnderlayRight />}
        snapPointsLeft={[150]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          // style={[styles.row, { backgroundColor: item.backgroundColor }]}
          className="flex flex-row flex-1 items-center justify-center bg-stone-400 my-1"
        >
          {/* <Text style={styles.text}>{`${item.key}`}</Text> */}
          <View className="flex flex-row flex-1 gap-4 justify-between border  p-4">
            <Text>{index}</Text>
            <TextInput
              value={`${index + 1}`}
              returnKeyType="done"
              className="border p-4"
            />
            <TextInput
              value={item.weight}
              keyboardType="numeric"
              returnKeyType="done"
              onChangeText={(text) => {
                setData((prev) => {
                  return prev.map((i) =>
                    i.key === item.key ? { ...item, weight: text } : i
                  );
                });
              }}
              className="border p-4"
            />
            <TextInput
              value={item.reps}
              keyboardType="numeric"
              returnKeyType="done"
              className="border p-4"
            />
            <TextInput
              value={item.rpe}
              keyboardType="numeric"
              returnKeyType="done"
              className="border p-4"
            />
          </View>
        </TouchableOpacity>
      </SwipeableItem>
    </ScaleDecorator>
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
      className="bg-red-500 flex-1 justify-end flex-row items-center pr-4 my-1"
    >
      <TouchableOpacity onPress={onPressDelete}>
        <Text className="font-bold text-white text-3xl">{`[delete]`}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

function UnderlayRight() {
  const { close } = useSwipeableItemParams<Item>();
  return (
    <Animated.View style={[styles.row, styles.underlayRight]}>
      <TouchableOpacity onPressOut={close}>
        <Text style={styles.text}>CLOSE</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
});

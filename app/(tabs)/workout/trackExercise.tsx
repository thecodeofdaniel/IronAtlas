import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
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
  weight: number;
  reps: number;
  rpe: number;
  type: string;
};

const initialSetData = [
  { key: generateId(), weight: 225, reps: 6, rpe: 8, type: 'normal' },
  { key: generateId(), weight: 225, reps: 4, rpe: 8, type: 'normal' },
  { key: generateId(), weight: 225, reps: 4, rpe: 9, type: 'normal' },
];

export default function TrackExercise() {
  // const [data, setData] = useState(initialData);
  const [data, setData] = useState(initialSetData);
  const itemRefs = useRef(new Map());

  const renderItem = useCallback((params: RenderItemParams<Sett>) => {
    const onPressDelete = () => {
      setData((prev) => {
        return prev.filter((item) => item !== params.item);
      });
    };

    return (
      <RowItem {...params} itemRefs={itemRefs} onPressDelete={onPressDelete} />
    );
  }, []);

  return (
    // <GestureHandlerRootView>
    <DraggableFlatList
      keyExtractor={(item) => item.key}
      data={data}
      renderItem={renderItem}
      onDragEnd={({ data }) => setData(data)}
      activationDistance={20}
    />
    //</GestureHandlerRootView>
  );
}

type RowItemProps = {
  item: Sett;
  drag: () => void;
  onPressDelete: () => void;
  itemRefs: React.MutableRefObject<Map<any, any>>;
};

function RowItem({ item, itemRefs, drag, onPressDelete }: RowItemProps) {
  // const [snapPointsLeft, setSnapPointsLeft] = useState([150]);

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
        // snapPointsLeft={snapPointsLeft}
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
            <TextInput value={item.type} className="border p-4" />
            <TextInput value={item.weight.toString()} keyboardType="numeric" />
            <TextInput value={item.reps.toString()} />
            <TextInput value={item.rpe.toString()} />
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

// function UnderlayRight() {
//   const { close } = useSwipeableItemParams<Item>();
//   return (
//     <Animated.View style={[styles.row, styles.underlayRight]}>
//       <TouchableOpacity onPressOut={close}>
//         <Text style={styles.text}>CLOSE</Text>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }

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

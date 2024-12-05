import React from 'react';
import { Text, View, TouchableOpacity, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from 'react-native-swipeable-item';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { TextInput } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { setsTableStyles as styles } from './setsTableStyles';

import SettTypeButton from './SettTypeButton';

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

type Props = {
  drag: () => void;
  getIndex: () => number | undefined;
  item: SettType;
  itemRefs: React.MutableRefObject<Map<any, any>>;
  uuid: string;
  editSet: (uuid: string, index: number, newSet: SettType) => void;
  onPressDelete: () => void;
};

export default function SetTableRow({
  drag,
  getIndex,
  item,
  itemRefs,
  uuid,
  editSet,
  onPressDelete,
}: Props) {
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
          overSwipe={20}
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
              <SettTypeButton
                uuid={uuid}
                index={index}
                item={item}
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

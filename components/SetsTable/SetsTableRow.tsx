import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from 'react-native-swipeable-item';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { TextInput } from 'react-native-gesture-handler';
import { setsTableStyles as styles } from './setsTableStyles';

import SetsTableTypeButton from './SetsTableTypeButton';
import { cn } from '@/lib/utils';
import { useTemplateStore } from '@/store/zustand/template/templateStore';

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
  setsLength: number;
};

export default function SetsTableRow({
  drag,
  getIndex,
  item,
  itemRefs,
  uuid,
  editSet,
  setsLength,
  onPressDelete,
}: Props) {
  const index = getIndex()!;
  const { inWorkout } = useTemplateStore((state) => state);

  return (
    <>
      <ScaleDecorator activeScale={1}>
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
            className={cn(
              'flex flex-1 flex-row items-center justify-center border-l-2 border-r-2 border-black bg-neutral p-2',
              {
                'border-b-2': index + 1 === setsLength,
              },
            )}
          >
            <View className="flex flex-1 flex-row justify-between">
              <SetsTableTypeButton
                uuid={uuid}
                index={index}
                item={item}
                editSet={editSet}
              />

              <TextInput
                editable={inWorkout}
                value={inWorkout ? item.weight : 'N/A'}
                keyboardType="numeric"
                returnKeyType="done"
                style={[styles.weightWidth, styles.infoFontSize]}
                className={cn('bg-neutral-accent p-1 text-neutral-contrast', {
                  'text-neutral-contrast/50': !inWorkout,
                })}
                onChangeText={(text) =>
                  editSet(uuid, index, { ...item, weight: text })
                }
              />
              <TextInput
                value={item.reps}
                keyboardType="numeric"
                returnKeyType="done"
                style={[styles.weightWidth, styles.infoFontSize]}
                className="bg-neutral-accent p-1 text-neutral-contrast"
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

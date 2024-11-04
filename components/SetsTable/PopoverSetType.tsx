import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import { setsTableStyles as styles } from './setsTable';
import clsx from 'clsx';

type Sett = {
  key: string;
  weight: string;
  reps: string;
  rpe: string;
  type: string;
};

type PopoverSetTypeProps = {
  item: Sett;
  setData: React.Dispatch<React.SetStateAction<Sett[]>>;
};

export default function PopoverSetType({ item, setData }: PopoverSetTypeProps) {
  const [showPopover, setShowPopover] = useState(false);

  const updateType = (typeLetter: string) => {
    setData((prev) => {
      return prev.map((i) =>
        i.key === item.key ? { ...item, type: typeLetter } : i,
      );
    });
    setShowPopover(false);
  };

  return (
    <Popover
      placement={PopoverPlacement.BOTTOM}
      isVisible={showPopover}
      onRequestClose={() => setShowPopover(false)} // if the user clicks outside popover
      from={
        <Pressable
          style={styles.setWidth}
          className="bg-stone-600"
          onPress={() => setShowPopover(true)}
        >
          <Text
            className={clsx('text-center text-white', {
              'text-yellow-500': item.type === 'W',
              'text-purple-500': item.type === 'D',
              'text-red-500': item.type === 'F',
            })}
          >
            {item.type.toUpperCase()}
          </Text>
        </Pressable>
      }
    >
      <View className="flex flex-col gap-1 p-2">
        <Pressable
          className="bg-yellow-500 px-4 py-2"
          onPress={() => {
            updateType('W');
          }}
        >
          <Text className="text-center text-yellow-900">Warmup</Text>
        </Pressable>
        <Pressable
          className="bg-stone-500 px-4 py-2"
          onPress={() => {
            updateType('N');
          }}
        >
          <Text className="text-center text-white">Normal</Text>
        </Pressable>
        <Pressable
          className="bg-purple-500 px-4 py-2"
          onPress={() => {
            updateType('D');
          }}
        >
          <Text className="text-center text-purple-900">Dropset</Text>
        </Pressable>
        <Pressable
          className="bg-red-500 px-4 py-2"
          onPress={() => {
            updateType('F');
          }}
        >
          <Text className="text-center text-red-900">Failure</Text>
        </Pressable>
      </View>
    </Popover>
  );
}

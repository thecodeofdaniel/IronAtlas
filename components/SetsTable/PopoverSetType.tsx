import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import { setsTableStyles as styles } from './setsTableStyles';
import clsx from 'clsx';

type Sett = {
  key: string;
  weight: string;
  reps: string;
  rpe: string;
  type: string;
};

type PopoverSetTypeProps = {
  uuid: string;
  item: SettType;
  index: number;
  editSet: (uuid: string, index: number, newSet: SettType) => void;
};

export default function PopoverSetType({
  uuid,
  item,
  index,
  editSet,
}: PopoverSetTypeProps) {
  const [showPopover, setShowPopover] = useState(false);

  const updateType = (typeLetter: string) => {
    editSet(uuid, index, { ...item, type: typeLetter });
    setShowPopover(false);
  };

  return (
    <Popover
      placement={PopoverPlacement.BOTTOM}
      isVisible={showPopover}
      onRequestClose={() => setShowPopover(false)} // if the user clicks outside popover
      from={
        <Pressable
          style={[styles.weightWidth]}
          className="bg-stone-600"
          onPress={() => setShowPopover(true)}
        >
          <Text
            style={styles.infoFontSize}
            className={clsx('text-center text-white p-1', {
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

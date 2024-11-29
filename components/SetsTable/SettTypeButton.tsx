import React from 'react';
import { Text, Pressable } from 'react-native';
import { setsTableStyles as styles } from './setsTableStyles';
import { type WorkoutStateFunctions } from '@/store/workout/workoutStore';
import clsx from 'clsx';

const TYPES = ['N', 'D'];

type Props = {
  uuid: string;
  index: number;
  item: SettType;
  editSet: WorkoutStateFunctions['editSet'];
};

export default function SettTypeButton({ uuid, index, item, editSet }: Props) {
  const rotateType = () => {
    // const currentIndex = TYPES.indexOf(item.type);
    // const nextIndex = (currentIndex + 1) % TYPES.length;
    // editSet(uuid, index, { ...item, type: TYPES[nextIndex] });

    const newType = item.type === 'N' ? 'D' : 'N';
    editSet(uuid, index, { ...item, type: newType });
  };

  return (
    <Pressable
      onPress={rotateType}
      className="rounded bg-stone-600"
      style={[styles.weightWidth, { height: 40 }]}
    >
      <Text
        className={clsx('rounded-md text-center text-xl', {
          'bg-black text-white': item.type === 'N',
          'bg-purple-900 text-purple-400': item.type === 'D',
          'bg-red-900 text-red-400': item.type === 'F',
        })}
        style={[styles.infoFontSize, { lineHeight: 40 }]}
      >
        {item.type}
      </Text>
    </Pressable>
  );
}

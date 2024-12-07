import React from 'react';
import { Text, Pressable } from 'react-native';
import { setsTableStyles as styles } from './setsTableStyles';
import { type TemplateStateFunctions } from '@/store/zustand/template/templateStore';
import { cn } from '@/lib/utils';

type Props = {
  uuid: string;
  index: number;
  item: SettType;
  editSet: TemplateStateFunctions['editSet'];
};

export default function SetsTableTypeButton({
  uuid,
  index,
  item,
  editSet,
}: Props) {
  const rotateType = () => {
    const newType = item.type === 'N' ? 'D' : 'N';
    editSet(uuid, index, { ...item, type: newType });
  };

  return (
    <Pressable
      onPress={rotateType}
      style={[styles.weightWidth, { height: 40 }]}
    >
      <Text
        className={cn('text-center text-xl', {
          'bg-neutral-accent text-neutral-contrast': item.type === 'N',
          'bg-purple-900 text-purple-400': item.type === 'D',
        })}
        style={[styles.infoFontSize, { lineHeight: 40 }]}
      >
        {item.type}
      </Text>
    </Pressable>
  );
}

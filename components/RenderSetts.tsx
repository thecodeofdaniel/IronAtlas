import React from 'react';
import { View, Text } from 'react-native';
import { TransformedTemplate } from '@/app/(tabs)/workout/components/RenderTemplates';
import { cn } from '@/lib/utils';

type Props = {
  volume: TransformedTemplate['volumes'][0];
  className?: string;
};

export default function RenderSetts({ volume, className }: Props) {
  const { setts } = volume;

  // const exerciseName = `• ${exerciseMap[exerciseId].label}`;

  const setsLength = setts.length;
  let prevType: string | null = null;
  let currentWeight: number | null = null;
  let currentNumOfReps: number | null = null;
  let counter = 1;

  // Goes through each set
  const setsDisplay = setts.map((set, idx) => {
    if (setsLength === 0) return null;

    let finalText: undefined | string;

    const type = set.type;
    const weight = set.weight;
    const reps = set.reps;
    const comma = idx >= setsLength - 1 ? '' : ', ';

    // Reset counter if set if different then previous
    if (
      prevType !== type ||
      currentWeight !== weight ||
      currentNumOfReps !== reps
    ) {
      counter = 1;
    }

    prevType = type;
    currentWeight = weight;
    currentNumOfReps = reps;

    // check if the next set has the same number of reps AND same type AND same weight
    if (
      idx < setsLength - 1 &&
      type === setts[idx + 1].type &&
      weight === setts[idx + 1].weight &&
      reps === setts[idx + 1].reps
    ) {
      counter += 1;
      return null;
    }

    const counterDisplay = counter > 1 ? counter + ' x ' : '';

    if (counter === 1 && !weight && !reps) {
      return null;
    } else if (!weight && !reps) {
      finalText = `${counter} x ${type}${comma}`;
    } else if (weight && !reps) {
      finalText = `${counterDisplay}${weight}lb${comma}`;
    } else if (!weight && reps) {
      finalText = `${counterDisplay}${reps}${comma}`;
    } else {
      finalText = `${counterDisplay}[${weight}lb • ${reps}]${comma}`;
    }

    return (
      <Text
        key={idx}
        className={cn('text-sm text-neutral-contrast/70', {
          'text-purple-400/70': type === 'D',
        })}
      >
        {finalText}
      </Text>
    );
  });

  return <View className={cn('flex flex-row', className)}>{setsDisplay}</View>;
}

import React from 'react';
import { View, Text } from 'react-native';
import { TransformedTemplate } from './RenderTemplates';
import { cn } from '@/lib/utils';

type Props = {
  superSettIndexHolder: Set<number>;
  exerciseMap: ExerciseMap;
  volume: TransformedTemplate['volumes'][0];
};

export default function RenderVolume({
  exerciseMap,
  superSettIndexHolder,
  volume,
}: Props) {
  const { volumeId, exerciseId, index, subIndex, setts } = volume;

  const exerciseName = `• ${exerciseMap[exerciseId].label}`;

  const setsLength = setts.length;
  let prevType: string | null = null;
  let currentWeight: number | null = null;
  let currentNumOfReps: number | null = null;
  let counter = 1;

  // Goes through each set
  const setsDisplay = setts.map((set, idx) => {
    // Don't reveal sets if number of sets is less than or equal to 1
    if (setsLength <= 1) return null;

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

    if (!weight && !reps) {
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

  // If set is part of a superset
  if (subIndex !== null) {
    return (
      <View key={volumeId}>
        {/* Add superset title if new index */}
        {!superSettIndexHolder.has(index) &&
          superSettIndexHolder.add(index) && (
            <View className="flex flex-row">
              <Text> </Text>
              <Text className="pl-1 text-neutral-contrast/80 underline">
                {'Superset'}
              </Text>
            </View>
          )}
        {/* Add exercise name */}
        <Text className="pl-2 text-neutral-contrast/80">{exerciseName}</Text>
        <View className="flex flex-row pl-4">{setsDisplay}</View>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-neutral-contrast/80">{exerciseName}</Text>
      <View className={cn('flex flex-row pl-3')}>{setsDisplay}</View>
    </View>
  );
}

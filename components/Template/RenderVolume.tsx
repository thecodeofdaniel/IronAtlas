import React from 'react';
import { View, Text } from 'react-native';
import { TransformedTemplate } from '../../app/(tabs)/workout/components/RenderRoutines';
import RenderSetts from '@/components/Template/RenderSetts';

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
        {/* <View className="flex flex-row pl-4">{setsDisplay}</View> */}
        <RenderSetts volume={volume} className="pl-4" />
      </View>
    );
  }

  return (
    <View key={volumeId}>
      <Text className="text-neutral-contrast/80">{exerciseName}</Text>
      {/* <View className={cn('flex flex-row pl-3')}>{setsDisplay}</View> */}
      <RenderSetts volume={volume} className="pl-2" />
    </View>
  );
}

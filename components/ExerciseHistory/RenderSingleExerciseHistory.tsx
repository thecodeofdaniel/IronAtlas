import React from 'react';
import { View, Text } from 'react-native';
import MyBorder from '@/components/ui/MyBorder';
import RenderSetts from '@/components/Template/RenderSetts';
import { type TransformedWorkout } from './ExerciseHistory';

type RenderWorkoutProps = {
  item: TransformedWorkout;
};

export default function RenderSingleExerciseHistory({
  item,
}: RenderWorkoutProps) {
  return (
    <MyBorder className="my-[1] bg-neutral-accent px-2">
      <Text className="text-lg font-semibold text-neutral-contrast">
        {item.workoutDate.toLocaleDateString()}
      </Text>

      {item.volumes.map((volume) => {
        const exerciseOrder = `${volume.index + 1}${volume.subIndex !== null ? `.${volume.subIndex + 1}` : ''})`;
        return (
          <View key={volume.volumeId} className="flex flex-row gap-2">
            <Text className="text-neutral-contrast">{exerciseOrder}</Text>
            <RenderSetts volume={volume} />
          </View>
        );
      })}
    </MyBorder>
  );
}

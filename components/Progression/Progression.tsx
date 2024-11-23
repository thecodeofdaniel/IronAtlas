import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import {
  analyzeProgression,
  getExerciseProgression,
  type SetData,
} from './utils';

type Props = {
  exerciseId: number;
};

export default function Progression({ exerciseId }: Props) {
  const [sets, setSets] = useState<SetData[]>([]);
  const [improvements, setImprovements] = useState<{
    weight: number;
    volume: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const val = await getExerciseProgression(exerciseId);
      setSets(val);

      const metrics = analyzeProgression(val);

      if (metrics.length > 0) {
        const firstWorkout = metrics[0];
        const lastWorkout = metrics[metrics.length - 1];

        const weightImprovement =
          ((lastWorkout.maxWeight - firstWorkout.maxWeight) /
            firstWorkout.maxWeight) *
          100;
        const volumeImprovement =
          ((lastWorkout.totalVolume - firstWorkout.totalVolume) /
            firstWorkout.totalVolume) *
          100;

        setImprovements({
          weight: weightImprovement,
          volume: volumeImprovement,
        });
      }
    };

    fetchData();
  }, [exerciseId]);

  if (!improvements) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>Weight Improvement: {improvements.weight.toFixed(1)}%</Text>
      <Text>Volume Improvement: {improvements.volume.toFixed(1)}%</Text>
      <Text>{JSON.stringify(analyzeProgression(sets))}</Text>
    </View>
  );
}

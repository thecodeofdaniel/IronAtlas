import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useExerciseStore } from '@/store/exercise/exerciseStore';
import { useWorkoutStore } from '@/store/workout/workoutStore';
import { setsTableStyles as styles } from './setsTableStyles';

type Props = {
  uuid: string;
};

export default function SetsTableHeader({ uuid }: Props) {
  const template = useWorkoutStore((state) => state.template);
  const exerciseMap = useExerciseStore((state) => state.exerciseMap);

  const exerciseId = template[uuid].exerciseId;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <Text className="text-4xl font-bold text-neutral-contrast">
          {exerciseMap[exerciseId!].label}
        </Text>
      </ScrollView>
      <View className="flex flex-row justify-between border-2 border-black bg-neutral-accent/90 p-2">
        <Text
          style={[styles.setWidth, styles.headerFontSize]}
          className="font-medium text-neutral-contrast"
        >
          Type
        </Text>
        <Text
          style={[styles.setWidth, styles.headerFontSize]}
          className="font-medium text-neutral-contrast"
        >
          Weight
        </Text>
        <Text
          style={[styles.setWidth, styles.headerFontSize]}
          className="font-medium text-neutral-contrast"
        >
          Reps
        </Text>
      </View>
    </View>
  );
}

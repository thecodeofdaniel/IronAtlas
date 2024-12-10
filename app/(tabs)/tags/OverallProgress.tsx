import React from 'react';
import { View, Text } from 'react-native';
import MyBorder from '@/components/ui/MyBorder';
import { TagProgress } from './utils';

type Props = {
  tagProgress: TagProgress;
};

export default function OverallProgress({ tagProgress }: Props) {
  return (
    <MyBorder className="bg-neutral-accent px-4 py-2">
      <Text className="mb-2 text-xl font-medium text-neutral-contrast">
        Overall Progress
      </Text>

      {/* One RM Progress */}
      <View className="mb-2">
        <Text className="font-medium text-neutral-contrast">
          Strength (1RM)
        </Text>
        <Text className="text-neutral-contrast">
          {tagProgress.oneRM.percentage.toFixed(1)}% overall (
          {tagProgress.oneRM.averagePerDay > 0 ? '+' : ''}
          {tagProgress.oneRM.averagePerDay.toFixed(2)}lbs/day)
        </Text>
      </View>

      {/* Volume Progress */}
      <View className="mb-2">
        <Text className="font-medium text-neutral-contrast">Volume</Text>
        <Text className="text-neutral-contrast">
          {tagProgress.volume.percentage.toFixed(1)}% overall (
          {tagProgress.volume.averagePerDay > 0 ? '+' : ''}
          {tagProgress.volume.averagePerDay.toFixed(2)}lbs/day)
        </Text>
      </View>

      {/* Max Weight Progress */}
      <View>
        <Text className="font-medium text-neutral-contrast">Max Weight</Text>
        <Text className="text-neutral-contrast">
          {tagProgress.maxWeight.percentage.toFixed(1)}% overall (
          {tagProgress.maxWeight.averagePerDay > 0 ? '+' : ''}
          {tagProgress.maxWeight.averagePerDay.toFixed(2)}lbs/day)
        </Text>
      </View>
    </MyBorder>
  );
}

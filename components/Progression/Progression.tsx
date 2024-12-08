import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import {
  analyzeProgression,
  getExerciseProgression,
  type SetData,
  findAllTimePRs,
  analyzeTrends,
  ProgressionMetrics,
  PRRecord,
  generateGraphMetrics,
  GraphData,
  GraphMetric,
} from './utils';
import TextContrast from '../ui/TextContrast';
import LineChartComp from '../LineChartComp';

type Props = {
  exerciseId: number;
};

const SUFFIX = 'lb';

export default function Progression({ exerciseId }: Props) {
  const [sets, setSets] = useState<SetData[]>([]);
  const [analysis, setAnalysis] = useState<{
    metrics: ProgressionMetrics[];
    allTimePRs: Record<string, PRRecord>;
    trends: ReturnType<typeof analyzeTrends>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const setsData = await getExerciseProgression(exerciseId);
        setSets(setsData);

        if (!setsData || setsData.length === 0) {
          setError('No data available for this exercise');
          return;
        }

        const metrics = analyzeProgression(setsData);
        const allTimePRs = findAllTimePRs(metrics);
        const trends = analyzeTrends(metrics);
        const graphMetrics = generateGraphMetrics(metrics);

        setAnalysis({ metrics, allTimePRs, trends });
        setGraphData(graphMetrics);
      } catch (err) {
        setError('Failed to load exercise data');
        console.error(err);
      }
    };

    fetchData();
  }, [exerciseId]);

  if (error) {
    return <TextContrast>{error}</TextContrast>;
  }

  if (!analysis || analysis.metrics.length === 0) {
    return <TextContrast>Loading...</TextContrast>;
  }

  // Find highest volume workout and its sets
  const highestVolumeWorkout = analysis.metrics.reduce((max, workout) =>
    workout.totalVolume > max.totalVolume ? workout : max,
  );

  // Get the sets for this workout
  const highestVolumeSets = sets.filter(
    (set) => set.workoutId === highestVolumeWorkout.workoutId,
  );

  // Get the 1-3 rep PR
  const strengthPR = analysis.allTimePRs['1-3'];

  // Find the set with highest reps
  const highestRepsSet = sets.reduce((max, set) =>
    set.reps > max.reps ? set : max,
  );

  // Helper function to prepare chart data
  const prepareChartData = (
    metrics: GraphMetric[],
  ): { dates: string[]; values: number[] } | undefined => {
    if (!metrics || metrics.length === 0) return undefined;

    return {
      dates: metrics.map((d) => formatDate(d.date)),
      values: metrics.map((d) => d.value),
    };
  };

  // Format dates for display
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  if (!graphData) return null;

  // Prepare chart data objects
  const charts = [
    {
      id: 'volume',
      title: 'Volume Progress',
      data: prepareChartData(graphData.volume),
      suffix: SUFFIX,
    },
    {
      id: 'oneRM',
      title: 'Estimated 1RM',
      data: prepareChartData(graphData.oneRM),
      suffix: SUFFIX,
    },
    {
      id: 'maxWeight',
      title: 'Max Weight',
      data: prepareChartData(graphData.maxWeight),
      suffix: SUFFIX,
    },
  ].filter((chart) => chart.data !== undefined); // Only include charts with data

  return (
    <View className="flex-1">
      {/* Stats Section */}
      <View className="py-2">
        {/* Strength PR */}
        {strengthPR && (
          <View className="flex-row items-center gap-2">
            <Text className="w-48 text-lg font-semibold text-neutral-contrast">
              Strength PR (1-3 reps)
            </Text>
            <Text className="text-neutral-contrast">
              {strengthPR.weight}
              {SUFFIX} x {strengthPR.reps}
            </Text>
            <Text className="text-neutral-contrast opacity-50">
              on {formatDate(strengthPR.date)}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <Text className="w-48 text-lg font-semibold text-neutral-contrast">
            Highest Volume Set
          </Text>
          <Text className="text-neutral-contrast">
            {highestVolumeSets[0]?.weight}
            {SUFFIX} x {highestVolumeSets[0]?.reps} ={' '}
            {highestVolumeSets[0]?.weight * highestVolumeSets[0]?.reps}
            {SUFFIX}
          </Text>
          <Text className="text-neutral-contrast opacity-50">
            on {formatDate(highestVolumeSets[0].date)}
          </Text>
        </View>

        {/* <View className="flex-row items-center gap-2">
          <Text className="w-48 text-lg font-semibold text-neutral-contrast">
            Most Reps
          </Text>
          <Text className="text-neutral-contrast">
            {highestRepsSet.weight}
            {SUFFIX} x {highestRepsSet.reps}
          </Text>
          <Text className="text-neutral-contrast opacity-50">
            on {formatDate(new Date(highestRepsSet.date))}
          </Text>
        </View> */}
      </View>

      {/* Existing Charts Section */}
      <FlatList
        horizontal
        data={charts}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        renderItem={({ item }) => (
          <View className="justify-center px-2">
            <LineChartComp
              data={item.data}
              title={item.title}
              yAxisSuffix={item.suffix}
            />
          </View>
        )}
        ListFooterComponent={() => <View className="w-4" />}
        ListHeaderComponent={() => <View className="w-4" />}
      />
    </View>
  );
}

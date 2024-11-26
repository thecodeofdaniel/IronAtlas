import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
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
        const data = await getExerciseProgression(exerciseId);
        setSets(data);

        if (!data || data.length === 0) {
          setError('No data available for this exercise');
          return;
        }

        const metrics = analyzeProgression(data);
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
  const prepareChartData = (metrics: GraphMetric[]) => {
    if (!metrics || metrics.length === 0) return null;

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

  const volumeData = prepareChartData(graphData.volume);
  const oneRMData = prepareChartData(graphData.oneRM);
  const maxWeightData = prepareChartData(graphData.maxWeight);

  return (
    <View>
      <TextContrast>Best Performances:</TextContrast>

      {/* Highest Volume */}
      <TextContrast>
        Most Volume: {highestVolumeWorkout.totalVolume.toFixed(1)}kg
        {highestVolumeSets.map(
          (set, index) =>
            ` ${index === 0 ? '(' : ''}${set.weight}kg × ${set.reps}${
              index === highestVolumeSets.length - 1 ? ')' : ', '
            }`,
        )}{' '}
        ({highestVolumeWorkout.date.toLocaleDateString()})
      </TextContrast>

      {/* Strength PR */}
      {strengthPR ? (
        <TextContrast>
          Strength PR: {strengthPR.weight}kg × {strengthPR.reps} reps (
          {strengthPR.date.toLocaleDateString()})
        </TextContrast>
      ) : (
        <TextContrast>No strength PR yet (1-3 reps)</TextContrast>
      )}

      {/* Highest Reps */}
      <TextContrast>
        Most Reps: {highestRepsSet.weight}kg × {highestRepsSet.reps} reps (
        {highestRepsSet.date.toLocaleDateString()})
      </TextContrast>

      {/* Display Progress */}
      {analysis.trends ? (
        <>
          <TextContrast>
            Progress over {analysis.metrics.length} workouts:
          </TextContrast>
          <TextContrast>
            Weight: {analysis.trends.weightProgress.percentage.toFixed(1)}%
          </TextContrast>
          <TextContrast>
            Volume: {analysis.trends.volumeProgress.percentage.toFixed(1)}%
          </TextContrast>
          <TextContrast>
            Estimated 1RM: {analysis.trends.oneRMProgress.percentage.toFixed(1)}
            %
          </TextContrast>
        </>
      ) : (
        <TextContrast>Not enough data to show progress</TextContrast>
      )}

      {/* Volume Chart */}
      {volumeData && (
        <LineChartComp
          data={volumeData}
          title="Volume Progress"
          yAxisLabel=""
          yAxisSuffix="kg"
        />
      )}

      {/* 1RM Chart */}
      {oneRMData && (
        <LineChartComp
          data={oneRMData}
          title="Estimated 1RM Progress"
          yAxisLabel=""
          yAxisSuffix="kg"
        />
      )}

      {/* Max Weight Chart */}
      {maxWeightData && (
        <LineChartComp
          data={maxWeightData}
          title="Max Weight Progress"
          yAxisLabel=""
          yAxisSuffix="kg"
        />
      )}
    </View>
  );
}

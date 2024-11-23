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
} from './utils';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getExerciseProgression(exerciseId);
        setSets(data);

        // Check if we have any data
        if (!data || data.length === 0) {
          setError('No data available for this exercise');
          return;
        }

        const metrics = analyzeProgression(data);
        const allTimePRs = findAllTimePRs(metrics);
        const trends = analyzeTrends(metrics);

        setAnalysis({ metrics, allTimePRs, trends });
      } catch (err) {
        setError('Failed to load exercise data');
        console.error(err);
      }
    };

    fetchData();
  }, [exerciseId]);

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!analysis || analysis.metrics.length === 0) {
    return <Text>Loading...</Text>;
  }

  const latestMetrics = analysis.metrics[analysis.metrics.length - 1];

  return (
    <View>
      {/* Display PRs */}
      {Object.keys(analysis.allTimePRs).length > 0 ? (
        <>
          <Text>Personal Records:</Text>
          {Object.entries(analysis.allTimePRs).map(([range, pr]) => (
            <Text key={range}>
              {range}: {pr.weight}kg × {pr.reps} reps (
              {pr.date.toLocaleDateString()})
            </Text>
          ))}
        </>
      ) : (
        <Text>No personal records yet</Text>
      )}

      {/* Display Progress */}
      {analysis.trends ? (
        <>
          <Text>Progress over {analysis.metrics.length} workouts:</Text>
          <Text>
            Weight: {analysis.trends.weightProgress.percentage.toFixed(1)}%
          </Text>
          <Text>
            Volume: {analysis.trends.volumeProgress.percentage.toFixed(1)}%
          </Text>
          <Text>
            Estimated 1RM: {analysis.trends.oneRMProgress.percentage.toFixed(1)}
            %
          </Text>
        </>
      ) : (
        <Text>Not enough data to show progress</Text>
      )}

      {/* Display latest workout */}
      {latestMetrics && (
        <>
          <Text>Latest Workout:</Text>
          <Text>
            Volume: {latestMetrics.movingAverages.volume.toFixed(1)}
            (3-workout average)
          </Text>
        </>
      )}
    </View>
  );
}

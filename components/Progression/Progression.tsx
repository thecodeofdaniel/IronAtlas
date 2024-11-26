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
import TextContrast from '../ui/TextContrast';

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
    return <TextContrast>{error}</TextContrast>;
  }

  if (!analysis || analysis.metrics.length === 0) {
    return <TextContrast>Loading...</TextContrast>;
  }

  const latestMetrics = analysis.metrics[analysis.metrics.length - 1];

  // Define the order of rep ranges
  const repRangeOrder = ['1-3', '4-6', '7-10', '11+'];

  return (
    <View>
      {/* Display PRs */}
      {Object.keys(analysis.allTimePRs).length > 0 ? (
        <>
          <TextContrast>Personal Records:</TextContrast>
          {repRangeOrder
            .filter((range) => analysis.allTimePRs[range])
            .map((range) => {
              const pr = analysis.allTimePRs[range];
              return (
                <TextContrast key={range}>
                  {range}: {pr.weight}kg × {pr.reps} reps (
                  {pr.date.toLocaleDateString()})
                </TextContrast>
              );
            })}
        </>
      ) : (
        <TextContrast>No personal records yet</TextContrast>
      )}

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

      {/* Display latest workout */}
      {latestMetrics && (
        <>
          <TextContrast>Latest Workout:</TextContrast>
          <TextContrast>
            Volume: {latestMetrics.movingAverages.volume.toFixed(1)}
            (3-workout average)
          </TextContrast>
        </>
      )}
    </View>
  );
}

import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { useThemeContext } from '@/store/context/themeContext';
import { getHSLColor } from '@/constants/theme';

const CHART_WIDTH = Dimensions.get('window').width - 40; // Adjust padding as needed

type LineChartProps = {
  data?: {
    dates: string[];
    values: number[];
  };
  title: string;
  yAxisLabel?: string;
  yAxisSuffix?: string;
};

export default function LineChartComp({
  data,
  title,
  yAxisLabel = '',
  yAxisSuffix = '',
}: LineChartProps) {
  const { colors } = useThemeContext();

  if (!data?.dates || !data?.values) {
    return null;
  }

  const SCREEN_HEIGHT = Dimensions.get('window').height / 2 - 200;

  return (
    <View className="flex flex-col items-center justify-center">
      <Text className="mb-1 text-xl font-semibold text-neutral-contrast">
        {title}
      </Text>
      <LineChart
        data={{
          labels: data.dates,
          // labels: [],
          datasets: [
            {
              data: data.values,
            },
          ],
        }}
        width={CHART_WIDTH}
        height={SCREEN_HEIGHT}
        yAxisLabel={yAxisLabel}
        yAxisSuffix={yAxisSuffix}
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: colors['--neutral-accent'],
          backgroundGradientFrom: colors['--neutral-accent'],
          backgroundGradientTo: colors['--neutral'],
          decimalPlaces: 0,
          // color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          // labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          color: (opacity = 1) =>
            getHSLColor(colors['--neutral-contrast'], opacity),
          labelColor: (opacity = 1) =>
            getHSLColor(colors['--neutral-contrast'], opacity),
          style: {
            borderRadius: 0,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '1',
            stroke: colors['--neutral'],
          },
        }}
        style={{
          borderRadius: 0,
          borderColor: 'black',
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderRightWidth: 4,
          borderBottomWidth: 4,
        }}
      />
    </View>
  );
}

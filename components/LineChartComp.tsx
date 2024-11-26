import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import { LineChart } from 'react-native-chart-kit';

type LineChartProps = {
  data?: {
    dates: string[];
    values: number[];
  };
  title?: string;
  yAxisLabel?: string;
  yAxisSuffix?: string;
};

export default function LineChartComp({
  data,
  title,
  yAxisLabel = '',
  yAxisSuffix = '',
}: LineChartProps) {
  if (!data?.dates || !data?.values) {
    return null;
  }

  return (
    <View className="flex flex-col items-center justify-center">
      {title && <Text>{title}</Text>}
      <LineChart
        data={{
          labels: data.dates,
          datasets: [
            {
              data: data.values,
            },
          ],
        }}
        width={Dimensions.get('window').width - 20}
        height={200}
        yAxisLabel={yAxisLabel}
        yAxisSuffix={yAxisSuffix}
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
            marginHorizontal: 'auto',
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
}

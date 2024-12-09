import React, { useEffect } from 'react';
import { Text, TextProps } from 'react-native';
import { useTimerStore } from '@/store/zustand/timer/timerStore';

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface CountdownTimerProps extends TextProps {
  className?: string;
}

export default function CountdownTimer({ className }: CountdownTimerProps) {
  console.log('Countdown timer');
  const seconds = useTimerStore((state) => state.seconds);
  const { tick } = useTimerStore((state) => state.actions);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  if (seconds === 0) return <Text className={className}>Start Timer</Text>;
  return <Text className={className}>{formatTime(seconds)}</Text>;
}

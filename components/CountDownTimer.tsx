import { cn } from '@/lib/utils';
import { useTimerStore } from '@/store/zustand/timer/timerStore';
import React, { useState, useEffect } from 'react';
import { Text, TextProps } from 'react-native';

interface CountdownTimerProps extends TextProps {
  initialSeconds?: number;
  onComplete?: () => void;
  isPaused?: boolean;
  className?: string;
}

export default function CountdownTimer({
  initialSeconds,
  onComplete,
  isPaused = false,
  style,
  className,
  ...props
}: CountdownTimerProps) {
  // const [seconds, setSeconds] = useState(initialSeconds);
  const { seconds, actions } = useTimerStore();

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
      return;
    }

    if (isPaused) return;

    const interval = setInterval(() => {
      // setSeconds((prev) => prev - 1);
      actions.tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, isPaused, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (seconds === 0) {
    return <Text className={cn(className)}>Start Timer</Text>;
  }

  return (
    <Text style={style} {...props} className={cn(className)}>
      {formatTime(seconds)}
    </Text>
  );
}

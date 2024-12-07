import { View, Text } from 'react-native';
import React, { Children } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function ScreenLayoutWrapper({ children, className }: Props) {
  return (
    <View className={cn('flex-1 bg-neutral p-2', className)}>{children}</View>
  );
}

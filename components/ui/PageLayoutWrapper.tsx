import { View, Text } from 'react-native';
import React, { Children } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function PageLayoutWrapper({ children, className }: Props) {
  return <View className={cn('bg-neutral p-4', className)}>{children}</View>;
}

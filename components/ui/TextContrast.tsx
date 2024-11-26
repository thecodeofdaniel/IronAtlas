import React from 'react';
import { Text } from 'react-native';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function TextContrast({ children, className }: Props) {
  return (
    <Text className={cn('text-neutral-contrast', className)}>{children}</Text>
  );
}

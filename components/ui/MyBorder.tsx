import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function MyBorder({ children, className }: Props) {
  return (
    <View
      className={cn(
        'border-b-4 border-l-2 border-r-4 border-t-2 border-black',
        className,
      )}
    >
      {children}
    </View>
  );
}

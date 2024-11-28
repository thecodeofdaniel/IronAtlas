import React from 'react';
import { StyleSheet, Pressable, PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
}

export default function MyButton({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      {...props}
      // className={clsx('bg-primary px-4 py-2', className)}
      className={cn('bg-primary px-4 py-2', className)}
      style={styles.button}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: 'black',
    borderTopWidth: 2,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 2,
  },
});

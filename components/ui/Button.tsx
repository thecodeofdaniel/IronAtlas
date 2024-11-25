import { StyleSheet, Pressable, PressableProps } from 'react-native';
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <Pressable
      {...props}
      className={clsx('bg-primary px-4 py-2', className)}
      style={styles.button}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: 'black',
    borderWidth: 1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
});

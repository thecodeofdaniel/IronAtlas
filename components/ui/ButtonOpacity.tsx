import {
  StyleSheet,
  Pressable,
  PressableProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import React from 'react';
import clsx from 'clsx';

interface Props extends TouchableOpacityProps {
  children: React.ReactNode;
  className?: string;
}

export default function ButtonOpacity({
  children,
  className,
  ...props
}: Props) {
  return (
    <TouchableOpacity
      {...props}
      className={clsx('bg-primary px-4 py-2', className)}
      style={styles.button}
    >
      {children}
    </TouchableOpacity>
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

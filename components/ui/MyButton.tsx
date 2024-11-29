import React, { forwardRef } from 'react';
import { StyleSheet, Pressable, PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
}

const MyButton = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(
          'border-b-4 border-l-2 border-r-4 border-t-2 border-black bg-primary px-4 py-2',
          className,
        )}
        // style={styles.button}
        {...props}
      >
        {children}
      </Pressable>
    );
  },
);

MyButton.displayName = 'MyButton';

const styles = StyleSheet.create({
  button: {
    borderColor: 'black',
    borderTopWidth: 2,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 2,
  },
});

export default MyButton;

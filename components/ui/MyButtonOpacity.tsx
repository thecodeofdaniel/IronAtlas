import React, { forwardRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  className?: string;
}

const MyButtonOpacity = forwardRef<
  React.ComponentRef<typeof TouchableOpacity>,
  ButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <TouchableOpacity
      ref={ref}
      className={cn(
        'border-b-4 border-l-2 border-r-4 border-t-2 border-black bg-primary px-4 py-2',
        className,
      )}
      // style={styles.button}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
});

MyButtonOpacity.displayName = 'MyButtonOpacity';

const styles = StyleSheet.create({
  button: {
    borderColor: 'black',
    borderTopWidth: 2,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 2,
  },
});

export default MyButtonOpacity;

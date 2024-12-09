import React, { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  className2?: string;
}

const MySimpleButton = forwardRef<
  React.ComponentRef<typeof TouchableOpacity>,
  ButtonProps
>(({ title, className, className2, ...props }, ref) => {
  return (
    <TouchableOpacity
      ref={ref}
      className={cn(
        'border-b-4 border-l-2 border-r-4 border-t-2 border-black bg-primary px-4 py-2',
        className,
      )}
      {...props}
    >
      <Text className={cn('text-center font-medium text-white', className2)}>
        {title}
      </Text>
    </TouchableOpacity>
  );
});

MySimpleButton.displayName = 'MySimpleButton';

export default MySimpleButton;

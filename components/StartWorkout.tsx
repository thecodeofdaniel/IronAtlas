import React, { forwardRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import Popover, { PopoverPlacement } from 'react-native-popover-view';

type StartWorkoutProps = {
  inWorkout: boolean;
  setInWorkout: React.Dispatch<React.SetStateAction<boolean>>;
  showPopover: boolean;
  setShowPopover: React.Dispatch<React.SetStateAction<boolean>>;
};

export default forwardRef<any, StartWorkoutProps>(function StartWorkout(
  { inWorkout, setInWorkout, showPopover, setShowPopover },
  ref,
) {
  return (
    <Popover
      ref={ref}
      isVisible={showPopover}
      onRequestClose={() => setShowPopover(false)}
      from={
        !inWorkout ? (
          <Pressable
            className="rounded-sm bg-green-500 px-4 py-2"
            onPress={() => setShowPopover(true)}
          >
            <Text className="text-center font-medium text-white">Start</Text>
          </Pressable>
        ) : (
          <Pressable
            className="rounded-sm bg-red-500 px-4 py-2"
            onPress={() => setShowPopover(true)}
          >
            <Text className="text-center font-medium text-white">End</Text>
          </Pressable>
        )
      }
    >
      {!inWorkout ? (
        <View className="flex flex-col gap-2 p-2">
          <Pressable
            className="bg-stone-600 px-4 py-2"
            onPress={() => {
              // ref.current?.requestClose();
              setShowPopover(false);
              setInWorkout(true);
            }}
          >
            <Text className="text-center font-medium text-white">
              Use template
            </Text>
          </Pressable>
          <Pressable
            className="bg-stone-600 px-4 py-2"
            onPress={() => {
              ref.current?.requestClose();
              setShowPopover(false);
              setInWorkout(true);
            }}
          >
            <Text className="text-center font-medium text-white">
              No template
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          className="bg-red-200 px-4 py-2"
          onPress={() => {
            ref.current?.requestClose();
            setShowPopover(false);
            setInWorkout(false);
          }}
        >
          <Text className="text-center font-medium text-white">End</Text>
        </Pressable>
      )}
    </Popover>
  );
});

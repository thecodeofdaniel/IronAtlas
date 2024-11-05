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
      from={
        !inWorkout ? (
          <Pressable className="bg-green-500">
            <Text>Start</Text>
          </Pressable>
        ) : (
          <Pressable className="bg-red-500">
            <Text>End</Text>
          </Pressable>
        )
      }
    >
      {!inWorkout ? (
        <Pressable
          className="bg-green-200"
          onPress={() => {
            setInWorkout(true);
            ref.current?.requestClose();
          }}
        >
          <Text>Start</Text>
        </Pressable>
      ) : (
        <Pressable
          className="bg-red-200"
          onPress={() => {
            setInWorkout(false);
            ref.current?.requestClose();
          }}
        >
          <Text>End</Text>
        </Pressable>
      )}
    </Popover>
  );

  // if (inWorkout) {
  //   return (
  //     <Pressable
  //       className="bg-red-500"
  //       onPress={() => {
  //         ref.current?.requestClose();
  //         setInWorkout(false);
  //       }}
  //     >
  //       <Text>End</Text>
  //     </Pressable>
  //   );
  // }
});

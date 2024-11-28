import { TouchableOpacity, Text } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSwipeableItemParams } from 'react-native-swipeable-item';
import MyButton from '../ui/MyButton';

export default function UnderlayLeft({
  drag,
  onPressDelete,
}: {
  drag: () => void;
  onPressDelete: () => void;
}) {
  const { item, percentOpen } = useSwipeableItemParams<TemplateObj>();
  const animStyle = useAnimatedStyle(
    () => ({
      opacity: percentOpen.value,
    }),
    [percentOpen],
  );

  return (
    <Animated.View
      style={[animStyle]}
      // className="my-[1] flex-1 flex-row items-center justify-end pr-4"

      // className="my-[1] flex-1 flex-row items-center justify-end border-b-4 border-r-4 border-black bg-red-500 pr-4"
    >
      {/* <TouchableOpacity onPress={onPressDelete}>
        <Text className="text-2xl font-bold text-white">Delete</Text>
      </TouchableOpacity> */}
      <MyButton
        className="mb-[1] flex-row items-center justify-end bg-red-500 py-1 pr-4"
        onPress={onPressDelete}
      >
        <Text className="text-2xl font-bold text-white">Delete</Text>
      </MyButton>
    </Animated.View>
  );
}

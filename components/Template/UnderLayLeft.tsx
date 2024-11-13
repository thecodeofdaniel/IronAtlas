import { TouchableOpacity, Text } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSwipeableItemParams } from 'react-native-swipeable-item';

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
      className="my-[1] flex-1 flex-row items-center justify-end bg-red-500 pr-4"
    >
      <TouchableOpacity onPress={onPressDelete}>
        <Text className="text-2xl font-bold text-white">Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

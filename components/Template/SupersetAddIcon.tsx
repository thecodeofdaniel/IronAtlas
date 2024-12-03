import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type Props = {
  isSuperset: boolean;
  colors?: Colors;
  onPress?: () => void;
};

export default function SupersetAddIcon({
  isSuperset,
  colors,
  onPress,
}: Props) {
  return (
    <Ionicons
      name="add"
      size={24}
      color={'white'}
      style={{
        // borderColor: 'white', borderWidth: 2,
        padding: 4,
        opacity: isSuperset ? 1 : 0,
      }}
      onPress={onPress}
    />
  );
}

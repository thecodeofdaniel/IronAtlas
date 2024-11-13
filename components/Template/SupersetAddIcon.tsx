import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isSuperset: boolean;
  onPress?: () => void;
};

export default function SupersetAddIcon({ isSuperset, onPress }: Props) {
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

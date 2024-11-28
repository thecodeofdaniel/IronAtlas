import React from 'react';
import { useRouter } from 'expo-router';
import { useModalStore } from '@/store/modalStore';
import { useActionSheet } from '@expo/react-native-action-sheet';
import SupersetAddIcon from './SupersetAddIcon';
import { useThemeContext } from '@/store/context/themeContext';
import { getActionSheetStyle } from '@/lib/actionSheetConfig';

type SupersetOptionsTypes = {
  uuid: string;
  isSuperset: boolean;
};

export default function SupersetOptions({
  uuid,
  isSuperset,
}: SupersetOptionsTypes) {
  const router = useRouter();
  const openModal = useModalStore((state) => state.openModal);
  const { colors } = useThemeContext();

  const handleOnPress = () => {
    openModal('selectExercises', {
      isSuperset: isSuperset,
      uuid: uuid,
      storeType: 'workout',
    });
    router.push('/modal');
  };

  return (
    <SupersetAddIcon
      isSuperset={isSuperset}
      onPress={handleOnPress}
      colors={colors}
    />
  );
}

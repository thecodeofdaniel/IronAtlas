import React from 'react';
import { useRouter } from 'expo-router';
import { useModalStore } from '@/store/modalStore';
import { useActionSheet } from '@expo/react-native-action-sheet';
import SupersetAddIcon from './SupersetAddIcon';

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
  const { showActionSheetWithOptions } = useActionSheet();

  const handleOnPress = () => {
    const options = ['Add exercise to superset', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            openModal('selectExercises', {
              isSuperset: isSuperset,
              uuid: uuid,
              storeType: 'workout',
            });
            router.push('/modal');
            break;
          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  return <SupersetAddIcon isSuperset={isSuperset} onPress={handleOnPress} />;
}

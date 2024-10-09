import { View, Text } from 'react-native';
import React from 'react';
import { ModalData } from '@/store/modalStore';

type Props = {
  modalData: ModalData['moveTag'];
  closeModal: () => void;
};

export default function MoveTag({ modalData, closeModal }: Props) {
  const id = modalData.pressedId;

  return (
    <View>
      <Text>MoveTag for {id}</Text>
    </View>
  );
}

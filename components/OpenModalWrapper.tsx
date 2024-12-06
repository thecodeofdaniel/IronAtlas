import React from 'react';
import { ModalData, useModalStore } from '@/store/zustand/modal/modalStore';
import { useRouter } from 'expo-router';

type OpenModalButtonProps = {
  activeModal: keyof ModalData;
  modalData: ModalData[keyof ModalData];
  children: React.ReactElement;
};

export default function OpenModalWrapper({
  activeModal,
  modalData,
  children,
}: OpenModalButtonProps) {
  const router = useRouter();
  const openModal = useModalStore((state) => state.openModal);

  return React.cloneElement(children, {
    onPress: () => {
      openModal(activeModal, modalData);
      router.push('/modal');
    },
  });
}

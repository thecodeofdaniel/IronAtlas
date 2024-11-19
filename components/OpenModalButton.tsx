import React from 'react';
import { Pressable } from 'react-native';
import { ModalData, useModalStore } from '@/store/modalStore';
import { useRouter } from 'expo-router';

type OpenModalButtonProps = {
  activeModal: keyof ModalData;
  modalData: ModalData[keyof ModalData];
  children: React.ReactNode;
  className?: string;
};

export default function OpenModalButton({
  activeModal,
  modalData,
  children,
  className,
}: OpenModalButtonProps) {
  const router = useRouter();
  const openModal = useModalStore((state) => state.openModal);

  return (
    <>
      <Pressable
        className={className}
        onPress={() => {
          openModal(activeModal, modalData);
          router.push('/modal');
        }}
      >
        {children}
      </Pressable>
    </>
  );
}

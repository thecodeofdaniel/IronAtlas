import { Button, Text, View } from 'react-native';
import { ModalData, useModalStore } from '@/store/modalStore';
import EditExerciseOrMuscleModal from './modals/editExerciseMuscleModal';

export default function Modal() {
  const { activeModal, modalData, closeModal } = useModalStore();

  return (
    <>
      {activeModal === 'editExerciseOrMuscle' && (
        <EditExerciseOrMuscleModal
          modalData={modalData as ModalData['editExerciseOrMuscle']}
          closeModal={closeModal}
        />
      )}
    </>
  );
}

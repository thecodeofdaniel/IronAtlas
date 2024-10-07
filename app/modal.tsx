import { ModalData, useModalStore } from '@/store/modalStore';
import EditExerciseOrMuscleModal from './modals/editExerciseMuscleModal';
import AddExerciseOrMuscleModal from './modals/addExerciseOrMuscleModal';

export default function Modal() {
  const { activeModal, modalData, closeModal } = useModalStore();

  return (
    <>
      {activeModal === 'addExerciseOrMuscle' && (
        <AddExerciseOrMuscleModal
          modalData={modalData as ModalData['addExerciseOrMuscle']}
          closeModal={closeModal}
        />
      )}
      {activeModal === 'editExerciseOrMuscle' && (
        <EditExerciseOrMuscleModal
          modalData={modalData as ModalData['editExerciseOrMuscle']}
          closeModal={closeModal}
        />
      )}
    </>
  );
}

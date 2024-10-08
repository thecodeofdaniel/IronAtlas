// Modal Manager

import { ModalData, useModalStore } from '@/store/modalStore';
import EditExerciseOrMuscleModal from './modals/editExerciseMuscleModal';
import AddExerciseOrMuscleModal from './modals/addExerciseOrMuscleModal';
import CreateExercise from './(tabs)/exercises/modals/createExercise';

export default function Modal() {
  const { activeModal, modalData, closeModal } = useModalStore();

  return (
    <>
      {activeModal === 'createExercise' && (
        <CreateExercise
          modalData={modalData as ModalData['createExercise']}
          closeModal={closeModal}
        />
      )}
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

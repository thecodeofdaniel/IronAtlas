// Modal Manager

import { ModalData, useModalStore } from '@/store/modalStore';
import EditExerciseOrMuscleModal from './modals/editExerciseMuscleModal';
import AddExerciseOrMuscleModal from './modals/addExerciseOrMuscleModal';
import CreateExercise from './(tabs)/exercises/modals/createExercise';
import EditExercise from './(tabs)/exercises/modals/editExercise';

export default function Modal() {
  const { activeModal, modalData, closeModal } = useModalStore();

  return (
    <>
      {activeModal === 'editExercise' && (
        <EditExercise
          modalData={modalData as ModalData['editExercise']}
          closeModal={closeModal}
        />
      )}
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

// Modal Manager

import { ModalData, useModalStore } from '@/store/modalStore';
import EditExerciseOrMuscleModal from '../components/modals/tags/editTag';
import AddExerciseOrMuscleModal from '../components/modals/tags/createTag';
import CreateExercise from '../components/modals/exercises/createExercise';
import EditExercise from '../components/modals/exercises/editExercise';

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

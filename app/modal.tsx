// Modal Manager

import { ModalData, useModalStore } from '@/store/modalStore';
import EditExerciseOrMuscleModal from '../components/modals/tags/editTag';
import AddExerciseOrMuscleModal from '../components/modals/tags/createTag';
import CreateExerciseModal from '../components/modals/exercises/createExercise';
import EditExercise from '../components/modals/exercises/editExercise';
import MoveTag from '@/components/modals/tags/moveTag';
import CreateOrUpdateExercise from '@/components/modals/exercises/createOrUpdateExercise';

export default function Modal() {
  const { activeModal, modalData, closeModal } = useModalStore();

  return (
    <>
      {activeModal === 'createOrUpdateExercise' && (
        <CreateOrUpdateExercise
          modalData={modalData as ModalData['createOrUpdateExercise']}
          closeModal={closeModal}
        />
      )}
      {activeModal === 'createExercise' && (
        <CreateExerciseModal
          modalData={modalData as ModalData['createExercise']}
          closeModal={closeModal}
        />
      )}
      {activeModal === 'editExercise' && (
        <EditExercise
          modalData={modalData as ModalData['editExercise']}
          closeModal={closeModal}
        />
      )}
      {activeModal === 'createTag' && (
        <AddExerciseOrMuscleModal
          modalData={modalData as ModalData['createTag']}
          closeModal={closeModal}
        />
      )}
      {activeModal === 'updateTag' && (
        <EditExerciseOrMuscleModal
          modalData={modalData as ModalData['updateTag']}
          closeModal={closeModal}
        />
      )}
      {activeModal === 'moveTag' && (
        <MoveTag
          modalData={modalData as ModalData['moveTag']}
          closeModal={closeModal}
        />
      )}
    </>
  );
}

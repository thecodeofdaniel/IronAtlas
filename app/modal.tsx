// Modal Manager

import { ModalData, useModalStore } from '@/store/modalStore';
import EditExerciseOrMuscleModal from './modals/tags/editTag';
import AddExerciseOrMuscleModal from './modals/tags/createTag';
import MoveTag from '@/app/modals/tags/moveTag';
import UpsertExercise from '@/app/modals/exercises/upsertExercise';
import SelectExercises from '@/app/modals/workout/SelectExercisesModal';
import { Stack } from 'expo-router';

export default function Modal() {
  const { activeModal, modalData, closeModal } = useModalStore();

  return (
    <>
      {activeModal === 'upsertExercise' && (
        <UpsertExercise
          modalData={modalData as ModalData['upsertExercise']}
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
      {activeModal === 'selectExercises' && (
        <SelectExercises
          modalData={modalData as ModalData['selectExercises']}
          closeModal={closeModal}
        />
      )}
    </>
  );
}

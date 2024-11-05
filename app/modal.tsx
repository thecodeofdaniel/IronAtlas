// Modal Manager

import { ModalData, useModalStore } from '@/store/modalStore';
import EditExerciseOrMuscleModal from '../components/modals/tags/editTag';
import AddExerciseOrMuscleModal from '../components/modals/tags/createTag';
import MoveTag from '@/components/modals/tags/moveTag';
import UpsertExercise from '@/components/modals/exercises/upsertExercise';
import SelectExercises from '@/components/modals/workout/SelectExercises';
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
      {activeModal === 'selectExercises' && <SelectExercises />}
    </>
  );
}

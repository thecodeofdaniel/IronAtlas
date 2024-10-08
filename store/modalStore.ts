import { create } from 'zustand';

export type ModalData = {
  // exercise: {
  //   initialData?: Partial<Exercise>;
  //   onSave?: (exercise: Exercise) => void;
  // };
  // muscleGroup: {
  //   groupId?: number;
  //   onSelect?: (groupId: number) => void;
  // };
  // settings: {
  //   section?: 'account' | 'preferences';
  // };
  // confirmation: {
  //   title: string;
  //   message: string;
  //   onConfirm: () => void;
  // };
  createExercise: {
    title: string;
  };
  editExerciseOrMuscle: {
    id: number;
  };
  addExerciseOrMuscle: {
    pressedId: number;
  };
};

interface ModalState {
  activeModal: keyof ModalData | null;
  modalData: ModalData[keyof ModalData] | null;
  openModal: <T extends keyof ModalData>(type: T, data?: ModalData[T]) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  modalData: null,
  openModal: (type, data) => set({ activeModal: type, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));

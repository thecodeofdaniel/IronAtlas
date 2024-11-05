import { create } from 'zustand';

export type ModalData = {
  upsertExercise: {
    id?: number;
  };
  createTag: {
    pressedId: number;
  };
  updateTag: {
    id: number;
  };
  moveTag: {
    pressedId: number;
  };
  selectExercises: {
    selectedTags: string[];
    setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
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

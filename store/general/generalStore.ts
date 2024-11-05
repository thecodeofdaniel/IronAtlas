import { produce } from 'immer';
import { create } from 'zustand';

export type GeneralStateVal = {
  pickedExercises: number[];
};

export type GeneralStateFunctions = {
  pushExerciseId: (newPickedExercise: number) => void;
  popExerciseId: () => void;
  clearExercises: () => void;
};

type GeneralStore = GeneralStateVal & GeneralStateFunctions;

export const useGeneralStore = create<GeneralStore>((set) => ({
  pickedExercises: [],
  pushExerciseId: (newPickedExercise) =>
    set(
      produce<GeneralStore>((state) => {
        state.pickedExercises.push(newPickedExercise);
      }),
    ),
  popExerciseId: () =>
    set(
      produce<GeneralStore>((state) => {
        state.pickedExercises.pop();
      }),
    ),
  clearExercises: () => set({ pickedExercises: [] }),
}));

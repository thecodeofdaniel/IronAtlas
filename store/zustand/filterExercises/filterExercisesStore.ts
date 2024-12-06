import { create } from 'zustand';

export type FilterExerciseStateVal = {
  selectedTags: string[];
};

export type FilterExerciseStateFunctions = {
  setSelectedTags: (tags: string[]) => void;
};

type FilterExerciseStore = FilterExerciseStateVal &
  FilterExerciseStateFunctions;

export const useFilterExerciseStore = create<FilterExerciseStore>((set) => ({
  selectedTags: [],
  setSelectedTags: (newTags) => set({ selectedTags: newTags }),
}));

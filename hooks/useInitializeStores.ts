import { useEffect, useState } from 'react';
import { useExerciseStore } from '@/store/zustand/exercise/exerciseStore';
import { useTagStore } from '@/store/zustand/tag/tagStore';

export function useInitializeStores() {
  const initExerciseStore = useExerciseStore(
    (state) => state.initExerciseStore,
  );
  const initTagStore = useTagStore((state) => state.initTagStore);

  useEffect(() => {
    initExerciseStore();
    initTagStore();
  }, []);
}

import { createWorkoutStore } from '../workout/workoutStore';

export const useTemplateStore = createWorkoutStore();

export function useTemplateStoreHook() {
  const { template, pickedExercises, pickedExercisesSet, ...actions } =
    useTemplateStore();

  return {
    template,
    pickedExercises,
    pickedExercisesSet,
    actions,
  };
}

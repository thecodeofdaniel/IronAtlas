import { useTemplateStore } from '../template/templateStore';
import { useWorkoutStore } from '../workout/workoutStore';

export function useExerciseSelectionHook(storeType: 'template' | 'workout') {
  const store = storeType === 'template' ? useTemplateStore : useWorkoutStore;
  const { template, pickedExercises, pickedExercisesSet, ...actions } = store();

  return {
    template,
    pickedExercises,
    pickedExercisesSet,
    actions,
  };
}

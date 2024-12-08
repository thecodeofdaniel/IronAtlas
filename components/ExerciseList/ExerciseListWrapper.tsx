import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { FilterExerciseStateVal } from '@/store/zustand/filterExercises/filterExercisesStore';
import {
  type ExerciseStateVal,
  type ExerciseStateFunctions,
  useExerciseStoreHook,
  useExerciseStore,
} from '@/store/zustand/exercise/exerciseStore';
import TextContrast from '@/components/ui/TextContrast';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import { exercises } from '@/db/seed/data';
import { formatTagOrExercise } from '@/utils/utils';
import { useRouter } from 'expo-router';
import { seed } from '@/db/seed/seed';
import { useTagStore } from '@/store/zustand/tag/tagStore';
import { cn } from '@/lib/utils';
import InsertExercisesAndTagsButton from '../InsertExercisesAndTagsButton';

// async function createExercises(func: ExerciseStateFunctions['createExercise']) {
//   for (const [index, exercise] of exercises.entries()) {
//     await func(
//       {
//         label: exercise.label,
//         value: formatTagOrExercise(exercise.label),
//         index: index,
//       },
//       [],
//     );
//   }
// }

type Props = {
  selectedTags: FilterExerciseStateVal['selectedTags'];
  exercisesList: ExerciseStateVal['exercisesList'];
  filteredExercises: ExerciseStateVal['exercisesList'];
  children: React.ReactNode;
  className?: string;
};

export default function ExerciseListWrapper({
  selectedTags,
  exercisesList,
  filteredExercises,
  children,
  className,
}: Props) {
  return (
    <>
      {selectedTags.length === 0 && exercisesList.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <TextContrast>No Exercises Found</TextContrast>
          <InsertExercisesAndTagsButton />
        </View>
      )}
      {selectedTags.length > 0 && filteredExercises.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <TextContrast>No Exercises Found!</TextContrast>
        </View>
      )}
      {filteredExercises.length > 0 && (
        <View className="flex-1">{children}</View>
      )}
    </>
  );
}

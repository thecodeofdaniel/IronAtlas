import React from 'react';
import { View } from 'react-native';
import { FilterExerciseStateVal } from '@/store/zustand/filterExercises/filterExercisesStore';
import { type ExerciseStateVal } from '@/store/zustand/exercise/exerciseStore';
import TextContrast from '@/components/ui/TextContrast';
import InsertExercisesAndTagsButton from '../InsertExercisesAndTagsButton';

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

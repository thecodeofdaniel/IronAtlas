import React, { useState } from 'react';
import { Text } from 'react-native';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import { useExerciseStore } from '@/store/zustand/exercise/exerciseStore';
import { useTagStore } from '@/store/zustand/tag/tagStore';
import { cn } from '@/lib/utils';
import { seedExercisesAndTags } from '@/db/seed/seed';

export default function InsertExercisesAndTagsButton() {
  const [clicked, setClicked] = useState(false);
  const initExerciseStore = useExerciseStore(
    (state) => state.initExerciseStore,
  );
  const initTagStore = useTagStore((state) => state.initTagStore);

  return (
    <MyButtonOpacity
      disabled={clicked}
      onPress={async () => {
        if (clicked) return;
        setClicked(true);
        try {
          await seedExercisesAndTags();
          initExerciseStore();
          initTagStore();
        } catch (error) {
          console.error('Error seeding data:', error);
        } finally {
          setClicked(false);
        }
      }}
    >
      <Text
        className={cn('font-medium text-white', {
          'opacity-50': clicked,
        })}
      >
        Add Exercises & Tags
      </Text>
    </MyButtonOpacity>
  );
}

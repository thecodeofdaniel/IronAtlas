import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStoreWithSetter } from '@/store/exercise/exerciseStore';
import { useTagStoreWithSetter } from '@/store/tag/tagStore';
import { getAllParentIds } from '@/utils/utils';
import TagTree from '../../selectFromTagTree';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';
import { TInsertExercise } from '@/db/schema';
import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

type CreateOrUpdateExerciseProps = {
  modalData: ModalData['upsertExercise'];
  closeModal: () => void;
};

export default function UpsertExercise({
  modalData,
  closeModal,
}: CreateOrUpdateExerciseProps) {
  const router = useRouter();
  const id = modalData.id;
  const {
    exerciseMap,
    exercisesList,
    setter: exerciseSetter,
  } = useExerciseStoreWithSetter();
  const { tagMap, setter: tagSetter } = useTagStoreWithSetter();

  // Fill out the data
  const [label, setLabel] = useState(id ? exerciseMap[id].label : '');
  const [selected, setSelected] = useState<{
    chosen: number[];
    preSelected: Set<number>;
  }>(() => {
    // If we're editing a exercise
    if (id) {
      // Grab the assoicated tags with exercise
      const tagIds = db
        .select({ tagId: schema.exerciseTags.tagId })
        .from(schema.exerciseTags)
        .where(eq(schema.exerciseTags.exerciseId, id))
        .all()
        .map((item) => item.tagId);

      // Based on the tags returned we gather all parentIds
      const preSelected = new Set(
        tagIds.flatMap((tag) => getAllParentIds(tagMap, tag))
      );

      return {
        chosen: tagIds,
        preSelected: preSelected,
      };
      // If we're creating a new exercise
    } else {
      return {
        chosen: [],
        preSelected: new Set(),
      };
    }
  });

  const handleOnPress = async () => {
    if (!label) return;

    const trimmedLabel = label.trim();
    if (!isValidTagOrExercise(trimmedLabel)) return;

    if (id) {
      exerciseSetter.updateExercise(id, {
        ...exerciseMap[id],
        label: trimmedLabel,
        value: formatTagOrExercise(trimmedLabel),
        tags: new Set(selected.chosen),
      });
    } else {
      const chosenTags = new Set(selected.chosen);

      const newExercise: TInsertExercise = {
        label: trimmedLabel,
        value: formatTagOrExercise(trimmedLabel),
        index: exercisesList.length,
      };

      // Add exercise to exercise pool
      const newExerciseId = await exerciseSetter.createExercise(
        newExercise,
        chosenTags
      );

      // if (newExerciseId) {
      //   // Add exercise to associated tags
      //   selected.chosen.forEach((tagId) =>
      //     tagSetter.addExerciseToTagState(tagId, newExerciseId)
      //   );
      // }
    }

    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: id ? 'Edit' : 'Create',
          headerBackTitle: 'Exercises',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleOnPress}
              disabled={label.trim() === ''}
              className="px-4 py-2 rounded-md bg-blue-500"
            >
              <Text className="text-white">{id ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 p-2 gap-4">
        <View>
          <Text className="text-xl">Exercise Name</Text>
          <TextInput
            className="h-10 border px-2 border-gray-400"
            value={label}
            onChangeText={setLabel}
            placeholder="Enter exercise name"
          />
        </View>
        <Text className="text-xl">Select body section tags</Text>
        <TagTree
          tagMap={tagMap}
          tagChildren={[0]}
          level={0}
          selected={selected}
          setSelected={setSelected}
        />
      </View>
    </>
  );
}

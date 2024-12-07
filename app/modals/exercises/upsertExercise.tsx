import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ModalData } from '@/store/zustand/modal/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStoreWithSetter } from '@/store/zustand/exercise/exerciseStore';
import { useTagStoreWithSetter } from '@/store/zustand/tag/tagStore';
import { getAllParentIds } from '@/utils/utils';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';
import { TInsertExercise } from '@/db/schema';
import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import Button from '@/components/ui/MyButton';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import SelectFromTagTree from '@/components/SelectFromTagTree';

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
        tagIds.flatMap((tag) => getAllParentIds(tagMap, tag)),
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
      exerciseSetter.updateExercise(
        id,
        {
          ...exerciseMap[id],
          label: trimmedLabel,
          value: formatTagOrExercise(trimmedLabel),
        },
        selected.chosen,
      );
    } else {
      // Add exercise to exercise pool
      exerciseSetter.createExercise(
        {
          label: trimmedLabel,
          value: formatTagOrExercise(trimmedLabel),
          index: exercisesList.length,
        },
        selected.chosen,
      );
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
            <MyButtonOpacity
              disabled={label.trim() === ''}
              onPress={handleOnPress}
            >
              <Text className="font-medium text-white">
                {id ? 'Update' : 'Add'}
              </Text>
            </MyButtonOpacity>
          ),
        }}
      />
      <View className="flex-1 gap-2 bg-neutral p-2">
        <View className="gap-1">
          <Text className="text-lg font-medium text-neutral-contrast">
            Exercise Name
          </Text>
          <TextInput
            className="h-10 border border-neutral-accent px-2 text-neutral-contrast"
            value={label}
            onChangeText={setLabel}
          />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-lg font-medium text-neutral-contrast">
            Select Tags
          </Text>
          <SelectFromTagTree
            tagMap={tagMap}
            tagChildren={tagMap[0].children}
            level={0}
            selected={selected}
            setSelected={setSelected}
          />
        </View>
      </View>
    </>
  );
}

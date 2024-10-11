import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { ModalData } from '@/store/modalStore';
import { Stack, useRouter } from 'expo-router';
import { useExerciseStore } from '@/store/exerciseStore';
import { useTagTreeStoreWithSetter } from '@/store/tagTreeStore';
import { formatTagOrExercise, isValidTagOrExercise } from '@/utils/utils';
import clsx from 'clsx';

const getAllParentIds = (tree: TagMap, id: number): number[] => {
  const parentIds: number[] = [];

  let currentId = id;
  let parentId = tree[currentId]?.parentId;

  while (parentId !== null) {
    parentIds.push(parentId);
    currentId = parentId;
    parentId = tree[currentId]?.parentId;
  }

  return parentIds;
};

type TreeProps = {
  tagMap: TagMap; // Accept itemMap as a prop
  tagChildren: number[]; // Accept item IDs as a prop
  level: number;
  selected: {
    chosen: number[];
    preSelected: Set<number>;
  };
  setSelected: React.Dispatch<
    React.SetStateAction<{
      chosen: number[];
      preSelected: Set<number>;
    }>
  >;
};

function Tree({
  tagMap,
  tagChildren,
  level = 0,
  selected,
  setSelected,
}: TreeProps) {
  const RenderItem = ({ item }: { item: Tag }) => {
    return (
      <TouchableOpacity
        className={clsx('p-2 my-[1] bg-blue-800', {
          'opacity-20': selected.preSelected.has(item.id),
          'bg-red-500':
            selected.chosen.includes(item.id) ||
            selected.preSelected.has(item.id),
        })}
        disabled={selected.preSelected.has(item.id)}
        onPress={() =>
          setSelected((prev) => {
            // Determine if chosen id is already included in array
            const isAlreadySelected = prev.chosen.includes(item.id);
            let newChosenList: number[] = isAlreadySelected
              ? prev.chosen.filter((id) => id !== item.id) // remove from array
              : [...prev.chosen, item.id]; // add to array

            // Add preSelected ids to set according to chosen ids
            const preSelectedSet = new Set<number>();
            for (const chosen of newChosenList) {
              const parentIds = getAllParentIds(tagMap, chosen);
              parentIds.forEach((id) => preSelectedSet.add(id));
            }

            return {
              chosen: newChosenList,
              preSelected: preSelectedSet,
            };
          })
        }
      >
        {/* Tags and options */}
        <View className="flex flex-row items-center justify-between flex-1">
          <Text className="text-white">{item.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const tags = tagChildren.map((id) => tagMap[id]);

  return (
    <View>
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <View key={item.id} style={{ paddingLeft: 5 * level }}>
              <RenderItem item={item} />
              {item.children.length > 0 &&
                // prevents chosen id from showing children
                !selected.chosen.includes(item.id) && (
                  <Tree
                    tagMap={tagMap}
                    tagChildren={item.children}
                    level={level + 1}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )}
            </View>
          );
        }}
      />
    </View>
  );
}

type Props = {
  modalData: ModalData['createExercise'];
  closeModal: () => void;
};

export default function CreateExerciseModal({ modalData, closeModal }: Props) {
  const router = useRouter();
  const createExercise = useExerciseStore((state) => state.createExercise);
  const { tagMap, setter } = useTagTreeStoreWithSetter();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<{
    chosen: number[];
    preSelected: Set<number>;
  }>({
    chosen: [],
    preSelected: new Set([]),
  });

  console.log(selected);

  const addExercise = () => {
    if (!name) return;

    const trimmedName = name.trim();

    if (!isValidTagOrExercise(trimmedName)) return;

    const newExercise = {
      id: Date.now(),
      label: name,
      value: formatTagOrExercise(name),
      order: 0, // since new exercise will be at the top
    };

    createExercise(newExercise);

    closeModal();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Add',
          headerBackTitle: 'Exercises',
          headerRight: () => (
            <TouchableOpacity
              onPress={addExercise}
              disabled={name.trim() === ''}
              className="px-4 py-2 rounded-md bg-blue-500"
            >
              <Text className="text-white">Create</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 p-2 gap-4">
        <View>
          <Text className="text-xl">Exercise Name</Text>
          <TextInput
            className="h-10 border px-2 border-gray-400"
            value={name}
            onChangeText={setName}
            placeholder="Enter exercise name"
          />
        </View>
        <View>
          <Text className="text-xl">Select body section tags</Text>
          <Tree
            tagMap={tagMap}
            tagChildren={[0]}
            level={0}
            selected={selected}
            setSelected={setSelected}
          />
        </View>
        {/* <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => {
              closeModal();
              router.back();
            }}
            className="border px-4 py-2 rounded-md"
          >
            <Text>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={addExercise}
            disabled={name.trim() === ''}
            className="border px-4 py-2 rounded-md"
          >
            <Text>Create</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </>
  );
}

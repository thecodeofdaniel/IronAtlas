import { create } from 'zustand';
import { produce, enableMapSet } from 'immer';
import { formatTagOrExercise } from '@/utils/utils';
import * as schema from '@/db/schema';
import { db } from '@/db/instance';
import { eq } from 'drizzle-orm';

type TagStateVal = {
  tagMap: TagMap;
  tagSet: Set<string>;
};

export type TagStateFunctions = {
  toggleTagOpen: (pressedId: number) => void;
  reorderTags: (dataList: Tag[]) => void;
  createChildTag: (pressedId: number, title: string) => void;
  deleteTag: (pressedId: number) => void;
  editTagTitle: (pressedId: number, newLabel: string, newValue: string) => void;
  moveTag: (pressedId: number, idToMove: number) => void;
  addExercise: (tagId: number, exerciseId: number) => void;
  removeExercise: (tagId: number, exerciseId: number) => void;
};

// take all the parentId's with null and turn them into 0s
// create a 0 root which represents all tags
// order key is important as it sets up array for children

// Use set to make tags unique
enableMapSet();
// const tags = Object.values(startingTree).map((tag) => tag.value);
// const startingTagSet = new Set(tags);

function transformDbTagsToState(): {
  tagMap: TagMap;
  tagSet: Set<string>;
} {
  const tagMap: TagMap = {
    0: {
      id: 0,
      label: 'All',
      value: 'all',
      parentId: null,
      order: 0,
      isOpen: true,
      children: [],
      exercises: new Set(),
    },
  };

  const tagSet: Set<string> = new Set();

  const dbTags = db.select().from(schema.tag).all();
  const exerciseTags = db.select().from(schema.exerciseTags).all();

  // First pass: create all tag objects and add associated exercises
  dbTags.forEach((dbTag) => {
    const exercises = new Set(
      exerciseTags
        .filter((et) => et.tagId === dbTag.id)
        .map((et) => et.exerciseId)
    );

    tagMap[dbTag.id] = {
      id: dbTag.id,
      label: dbTag.label,
      value: dbTag.value,
      parentId: dbTag.parentId === null ? 0 : dbTag.parentId,
      order: dbTag.order,
      isOpen: dbTag.isOpen,
      children: [],
      // exercises: new Set(dbTag.exercises.map((exercise) => exercise.value)),
      exercises: exercises,
    };

    // TODO put all tag values into a set and return
    tagSet.add(dbTag.value);
  });

  // Second pass: populate children arrays for each tag object and sort by order
  Object.values(tagMap).forEach((tag) => {
    if (tag.parentId !== null) {
      tagMap[tag.parentId].children.push(tag.id);
    }
  });
  Object.values(tagMap).forEach((tag) => {
    tag.children.sort((a, b) => tagMap[a].order - tagMap[b].order);
  });

  return {
    tagMap,
    tagSet,
  };
}

const starting = transformDbTagsToState();

type TagStore = TagStateVal & TagStateFunctions;

export const useTagStore = create<TagStore>()((set, get) => ({
  tagMap: starting.tagMap,
  tagSet: starting.tagSet,
  toggleTagOpen: (pressedId: number) =>
    set((state) => {
      const newTagMap = { ...state.tagMap };
      const newValue = !newTagMap[pressedId].isOpen;

      newTagMap[pressedId] = {
        ...newTagMap[pressedId],
        isOpen: newValue,
      };

      // Return the new state immediately
      const newState = { tagMap: newTagMap };

      // Perform the database update asynchronously
      db.update(schema.tag)
        .set({ isOpen: newValue })
        .where(eq(schema.tag.id, pressedId))
        .execute()
        .catch((error) => {
          console.error('Failed to update tag open state:', error);
          // Revert the state change if the DB update fails
          set(() => ({ tagMap: get().tagMap }));
        });

      return newState;
    }),
  reorderTags: (dataList: Tag[]) =>
    set((state) => {
      const newItemMap = { ...state.tagMap };

      // First, update the order of items
      dataList.forEach((item, index) => {
        newItemMap[item.id] = {
          ...newItemMap[item.id],
          order: index,
        };
      });

      // Then, update the parent's children array to reflect the new order
      if (dataList.length > 0 && dataList[0].parentId !== null) {
        const parentId = dataList[0].parentId;
        const newChildrenOrder = dataList.map((item) => item.id);
        console.log(newChildrenOrder);
        newItemMap[parentId] = {
          ...newItemMap[parentId],
          children: newChildrenOrder,
        };
      }

      return { tagMap: newItemMap };
    }),
  createChildTag: (pressedId: number, title: string) =>
    set((state) => {
      const newItems = { ...state.tagMap };
      const pressedItem = newItems[pressedId];
      const nextIndex = pressedItem.children.length;

      const newItem: Tag = {
        id: Date.now(), // Use a unique ID generator in a real scenario
        label: title,
        value: formatTagOrExercise(title),
        parentId: pressedItem.id,
        order: nextIndex,
        isOpen: false,
        children: [],
        exercises: new Set(),
      };

      // Create a new copy of the pressed item with the updated children array
      newItems[pressedId] = {
        ...pressedItem,
        children: [...pressedItem.children, newItem.id], // Create new array instead of using push
      };

      newItems[newItem.id] = newItem; // Add the new item to the map

      return {
        tagMap: newItems,
        tagSet: new Set([...state.tagSet, newItem.value]),
      };
    }),
  deleteTag: (pressedId: number) =>
    set(
      produce<TagStore>((state) => {
        // Helper function to recursively delete an item and all its children
        const deleteItemAndChildren = (id: number) => {
          const item = state.tagMap[id];
          if (!item) return;

          // Recursively delete all children first
          item.children.forEach((childId) => {
            deleteItemAndChildren(childId);
          });

          // If this item has a parent, remove it from parent's children array
          if (item.parentId !== null && state.tagMap[item.parentId]) {
            state.tagMap[item.parentId].children = state.tagMap[
              item.parentId
            ].children.filter((childId) => childId !== id);
          }

          // Delete the item itself
          state.tagSet.delete(item.value);
          delete state.tagMap[id];
        };

        deleteItemAndChildren(pressedId);
      })
    ),
  editTagTitle: (pressedId: number, newTitle: string, newValue: string) =>
    set(
      produce<TagStore>((state) => {
        const prevTagVal = state.tagMap[pressedId].value;
        state.tagSet.delete(prevTagVal);
        state.tagMap[pressedId].label = newTitle;
        state.tagSet.add(newValue);
      })
    ),
  moveTag: (pressedId, idToMove) =>
    set(
      produce<TagStore>((state) => {
        // Get the old parentId (0 if root)
        const oldParentId = state.tagMap[idToMove].parentId ?? 0;

        // Remove idToMove from the old parent's children array
        state.tagMap[oldParentId].children = state.tagMap[
          oldParentId
        ].children.filter((id) => id !== idToMove);

        // Update the parentId of the tag being moved
        state.tagMap[idToMove].parentId = pressedId;

        // Add idToMove to the new parent's children array
        state.tagMap[pressedId].children.push(idToMove);
      })
    ),
  addExercise: (tagId, exerciseId) =>
    set(
      produce<TagStore>((state) => {
        state.tagMap[tagId].exercises.add(exerciseId);
      })
    ),
  removeExercise: (tagId, exerciseId) =>
    set(
      produce<TagStore>((state) => {
        state.tagMap[tagId].exercises.delete(exerciseId);
      })
    ),
  // increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

export function useTagStoreWithSetter(): TagStateVal & {
  setter: TagStateFunctions;
} {
  const {
    tagMap,
    tagSet,
    toggleTagOpen,
    reorderTags,
    createChildTag,
    deleteTag,
    editTagTitle,
    moveTag,
    addExercise,
    removeExercise,
  } = useTagStore((state) => state);

  return {
    tagMap,
    tagSet,
    setter: {
      toggleTagOpen,
      reorderTags,
      createChildTag,
      deleteTag,
      editTagTitle,
      moveTag,
      addExercise,
      removeExercise,
    },
  };
}

import { create } from 'zustand';
import { produce, enableMapSet } from 'immer';
import { formatTag } from '@/utils/utils';

type TagTreeStateVal = {
  tagMap: TagMap;
  tagSet: Set<string>;
};

export type TagTreeStateFunctions = {
  reorderTags: (dataList: Tag[]) => void;
  createChildTag: (pressedId: number, title: string) => void;
  deleteTag: (pressedId: number) => void;
  editTagTitle: (pressedId: number, newTitle: string) => void;
  moveTag: (pressedId: number, idToMove: number) => void;
};

// take all the parentId's with null and turn them into 0s
// create a 0 root which represents all tags

const startingTree: TagMap = {
  // Root
  0: {
    id: 0, // 0 does not exist in db, we put this here
    title: 'All',
    parentId: null,
    order: 0,
    isOpen: true,
    children: [1, 3],
  },
  1: {
    id: 1,
    title: 'Upper',
    parentId: 0,
    order: 0,
    isOpen: true,
    children: [2, 6],
  },
  2: {
    id: 2,
    title: 'Chest',
    parentId: 1,
    order: 0,
    isOpen: false,
    children: [4, 5],
  },
  3: {
    id: 3,
    title: 'Lower',
    parentId: 0,
    order: 1,
    isOpen: false,
    children: [],
  },
  4: {
    id: 4,
    title: 'Upper Chest',
    parentId: 2,
    order: 0,
    isOpen: false,
    children: [],
  },
  5: {
    id: 5,
    title: 'Middle Chest',
    parentId: 2,
    order: 1,
    isOpen: false,
    children: [],
  },
  6: {
    id: 6,
    title: 'Arms',
    parentId: 1,
    order: 0,
    isOpen: false,
    children: [7, 8],
  },
  7: {
    id: 7,
    title: 'Triceps',
    parentId: 6,
    order: 0,
    isOpen: false,
    children: [],
  },
  8: {
    id: 8,
    title: 'Biceps',
    parentId: 6,
    order: 1,
    isOpen: false,
    children: [],
  },
};

// Use set to make tags unique
enableMapSet();
const tags = Object.values(startingTree).map((tag) => formatTag(tag.title));
const startingTagSet = new Set(tags);

type TagTreeStore = TagTreeStateVal & TagTreeStateFunctions;

export const useTagTreeStore = create<TagTreeStore>()((set) => ({
  tagMap: startingTree,
  tagSet: startingTagSet,
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
        title: title,
        parentId: pressedItem.id,
        order: nextIndex,
        isOpen: false,
        children: [],
      };

      // Create a new copy of the pressed item with the updated children array
      newItems[pressedId] = {
        ...pressedItem,
        children: [...pressedItem.children, newItem.id], // Create new array instead of using push
      };

      newItems[newItem.id] = newItem; // Add the new item to the map

      return {
        tagMap: newItems,
        tagSet: new Set([...state.tagSet, formatTag(newItem.title)]),
      };
    }),
  deleteTag: (pressedId: number) =>
    set(
      produce<TagTreeStore>((state) => {
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
          state.tagSet.delete(formatTag(item.title));
          delete state.tagMap[id];
        };

        deleteItemAndChildren(pressedId);
      })
    ),
  editTagTitle: (pressedId: number, newTitle: string) =>
    set(
      produce<TagTreeStore>((state) => {
        const prevTitle = formatTag(state.tagMap[pressedId].title);
        state.tagSet.delete(prevTitle);
        state.tagMap[pressedId].title = newTitle;
        state.tagSet.add(formatTag(newTitle));
      })
    ),
  moveTag: (pressedId, idToMove) =>
    set(
      produce<TagTreeStore>((state) => {
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
  // increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

export function useTagTreeStoreWithSetter(): TagTreeStateVal & {
  setter: TagTreeStateFunctions;
} {
  const {
    tagMap,
    tagSet,
    reorderTags,
    createChildTag,
    deleteTag,
    editTagTitle,
    moveTag,
  } = useTagTreeStore((state) => state);

  return {
    tagMap,
    tagSet,
    setter: {
      reorderTags,
      createChildTag,
      deleteTag,
      editTagTitle,
      moveTag,
    },
  };
}

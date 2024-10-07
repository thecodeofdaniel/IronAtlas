import { create } from 'zustand';

type Item = {
  id: number;
  title: string;
  parentId: number | null;
  order: number;
  isOpen: boolean;
  children: number[]; // Store only child IDs
};

type ItemMap = {
  [key: number]: Item; // Create an ItemMap type
};

type ExerciseTreeStateVal = {
  exerciseTree: ItemMap;
};

export type ExerciseTreeStateSetters = {
  reorder: (dataList: Item[]) => void;
  createChild: (pressedId: number) => void;
  deleteTagOrExercise: (pressedId: number) => void;
};

const startingTree: ItemMap = {
  // Root
  0: {
    id: 0,
    title: 'Root',
    parentId: null,
    order: 0,
    isOpen: true,
    children: [1, 3],
  },
  1: {
    id: 1,
    title: 'Hello',
    parentId: 0,
    order: 0,
    isOpen: true,
    children: [2],
  },
  2: {
    id: 2,
    title: 'World',
    parentId: 1,
    order: 0,
    isOpen: false,
    children: [4, 5],
  },
  3: {
    id: 3,
    title: 'Goodbye',
    parentId: 0,
    order: 1,
    isOpen: false,
    children: [],
  },
  4: {
    id: 4,
    title: 'Again',
    parentId: 2,
    order: 0,
    isOpen: false,
    children: [],
  },
  5: {
    id: 5,
    title: 'Too',
    parentId: 2,
    order: 1,
    isOpen: false,
    children: [],
  },
};

export const useExerciseTreeStore = create<
  ExerciseTreeStateVal & ExerciseTreeStateSetters
>()((set) => ({
  exerciseTree: startingTree,
  reorder: (dataList: Item[]) =>
    set((state) => {
      const newItemMap = { ...state.exerciseTree };

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

      return { exerciseTree: newItemMap };
    }),
  createChild: (pressedId: number) =>
    set((state) => {
      const newItems = { ...state.exerciseTree };
      const pressedItem = newItems[pressedId];
      const nextIndex = pressedItem.children.length;

      const newItem: Item = {
        id: Date.now(), // Use a unique ID generator in a real scenario
        title: 'ZZZZZZZZZZZZZZZZ',
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

      return { exerciseTree: newItems };
    }),
  deleteTagOrExercise: (pressedId: number) =>
    set((state) => {
      const newItems = { ...state.exerciseTree };

      // Helper function to recursively delete an item and all its children
      const deleteItemAndChildren = (id: number) => {
        const item = newItems[id];
        if (!item) return;

        // Recursively delete all children first
        item.children.forEach((childId) => {
          deleteItemAndChildren(childId);
        });

        // If this item has a parent, remove it from parent's children array
        if (item.parentId !== null && newItems[item.parentId]) {
          newItems[item.parentId] = {
            ...newItems[item.parentId],
            children: newItems[item.parentId].children.filter(
              (childId) => childId !== id
            ),
          };
        }

        // Delete the item itself
        delete newItems[id];
      };

      deleteItemAndChildren(pressedId);

      return { exerciseTree: newItems };
    }),
  // increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

export function useExerciseTreeStoreWithSetter(): ExerciseTreeStateVal & {
  setter: ExerciseTreeStateSetters;
} {
  const { exerciseTree, reorder, createChild, deleteTagOrExercise } =
    useExerciseTreeStore((state) => state);

  return {
    exerciseTree,
    setter: {
      reorder,
      createChild,
      deleteTagOrExercise,
    },
  };
}

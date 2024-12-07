import { create } from 'zustand';
import { produce, enableMapSet } from 'immer';
import { formatTagOrExercise } from '@/utils/utils';
import * as schema from '@/db/schema';
import { db } from '@/db/instance';
import { eq } from 'drizzle-orm';
import transformDbTagsToState from './tagTransform';
import { trueParentId } from './tagTransform';

export type TagStateVal = {
  tagMap: TagMap;
  tagSet: Set<string>;
};

export type TagStateFunctions = {
  initTagStore: () => void;
  toggleTagOpen: (pressedId: number) => void;
  reorderTags: (dataList: Tag[]) => void;
  createChildTag: (pressedId: number, title: string) => Promise<void>;
  deleteTag: (pressedId: number) => Promise<void>;
  editTagTitle: (
    pressedId: number,
    newLabel: string,
    newValue: string,
  ) => Promise<void>;
  moveTag: (pressedId: number, idToMove: number) => Promise<void>;
};

export type TagStore = TagStateVal & TagStateFunctions;

// Use set to make tags unique
enableMapSet();

export const useTagStore = create<TagStore>()((set, get) => ({
  tagMap: {},
  tagSet: new Set<string>(),
  initTagStore: () => {
    const starting = transformDbTagsToState();

    set({
      tagMap: starting.tagMap,
      tagSet: starting.tagSet,
    });
  },
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
          index: index,
        };

        // Update database asynchronously
        db.update(schema.tag)
          .set({ index: index })
          .where(eq(schema.tag.id, item.id))
          .execute()
          .catch((error) => {
            console.error('Failed to update tag order state', error);
          });
      });

      // Then, update the parent's children array to reflect the new order
      if (dataList.length > 0 && dataList[0].parentId !== null) {
        const parentId = dataList[0].parentId;
        const newChildrenOrder = dataList.map((item) => item.id);
        // console.log(newChildrenOrder);
        newItemMap[parentId] = {
          ...newItemMap[parentId],
          children: newChildrenOrder,
        };
      }

      return { tagMap: newItemMap };
    }),
  createChildTag: async (pressedId: number, title: string) => {
    try {
      // Create tag within db
      const [newTag] = await db
        .insert(schema.tag)
        .values({
          label: title,
          value: formatTagOrExercise(title),
          index: get().tagMap[pressedId].children.length,
          isOpen: false,
          parentId: trueParentId(pressedId),
        })
        .returning();

      set((state) => {
        const newTagMap = { ...state.tagMap };
        const pressedTag = newTagMap[pressedId];

        // Update the parentTag's children
        newTagMap[pressedId] = {
          ...pressedTag,
          children: [...pressedTag.children, newTag.id],
        };

        // Add new tag to the map
        newTagMap[newTag.id] = {
          ...newTag,
          children: [],
        };

        return {
          tagMap: newTagMap,
          tagSet: new Set([...state.tagSet, newTag.value]),
        };
      });
    } catch (error) {
      console.error('Failed to create child tag:', error);
    }
  },
  deleteTag: async (pressedId: number) => {
    try {
      // First update the state to prevent rendering issues
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
        }),
      );

      // Then perform database operations
      await db.delete(schema.tag).where(eq(schema.tag.id, pressedId));
      await db
        .delete(schema.exerciseTags)
        .where(eq(schema.exerciseTags.tagId, pressedId));
    } catch (error) {
      console.error('Error: Deleting tag and associated exercises', error);
    }
  },
  editTagTitle: async (
    pressedId: number,
    newTitle: string,
    newValue: string,
  ) => {
    try {
      await db
        .update(schema.tag)
        .set({ label: newTitle, value: newValue })
        .where(eq(schema.tag.id, pressedId));

      set(
        produce<TagStore>((state) => {
          const prevTagVal = state.tagMap[pressedId].value;
          state.tagSet.delete(prevTagVal);
          state.tagMap[pressedId].label = newTitle;
          state.tagMap[pressedId].value = newValue;
          state.tagSet.add(newValue);
        }),
      );
    } catch (error) {
      console.error('Error: Trying to edit tag', error);
    }
  },
  moveTag: async (idToBeUnder, idToMove) => {
    try {
      // Update the parentId and order
      await db
        .update(schema.tag)
        // If tag is moved under root (0) then update as null in db
        .set({
          parentId: trueParentId(idToBeUnder),
          index: get().tagMap[idToBeUnder].children.length,
        })
        .where(eq(schema.tag.id, idToMove));

      set(
        produce<TagStore>((state) => {
          // Get the old parentId (0 if root)
          const oldParentId = state.tagMap[idToMove].parentId ?? 0;

          // Remove idToMove from the old parent's children array
          state.tagMap[oldParentId].children = state.tagMap[
            oldParentId
          ].children.filter((id) => id !== idToMove);

          // Update the parentId of the tag being moved
          state.tagMap[idToMove].parentId = idToBeUnder;

          // Add idToMove to the new parent's children array
          state.tagMap[idToBeUnder].children.push(idToMove);
        }),
      );
    } catch (error) {
      console.error('Error: Unable to move tag', error);
    }
  },
}));

export function useTagStoreHook(): TagStateVal & {
  setter: TagStateFunctions;
} {
  const {
    tagMap,
    tagSet,
    initTagStore,
    toggleTagOpen,
    reorderTags,
    createChildTag,
    deleteTag,
    editTagTitle,
    moveTag,
  } = useTagStore((state) => state);

  return {
    tagMap,
    tagSet,
    setter: {
      initTagStore,
      toggleTagOpen,
      reorderTags,
      createChildTag,
      deleteTag,
      editTagTitle,
      moveTag,
    },
  };
}

import { useTagStore } from '@/store/zustand/tag/tagStore';

export function formatTagOrExercise(input: string) {
  return input
    .trim() // Remove leading and trailing spaces
    .replace(/\s+/g, '_') // Replace one or more spaces with an underscore
    .toLowerCase(); // Convert the entire string to lowercase
}

export function isValidTagOrExercise(_input: string): boolean {
  // Check for empty input or leading/trailing spaces
  if (_input === null || _input === '') return false;

  const input = _input.trim();

  if (input === '') {
    return false;
  }

  // Regular expression to check if the tag contains only letters and spaces
  const pattern = /^[a-zA-Z ]+$/; // allows only letters and spaces
  return pattern.test(input);
}

/** Gets all parentIds' for certain tag iteratively */
export const getAllParentIds = (tagMap: TagMap, id: number): number[] => {
  const parentIds: number[] = [];

  let currentId = id;
  let parentId = tagMap[currentId]?.parentId;

  while (parentId !== null) {
    parentIds.push(parentId);
    currentId = parentId;
    parentId = tagMap[currentId]?.parentId;
  }

  return parentIds;
};

export function getAllChildrenIds(tagMap: TagMap, tagId: number): number[] {
  const tag = tagMap[tagId];

  // If tag does not have children then return
  if (tag.children.length === 0) {
    return [];
  }

  const childrenIds = tag.children;
  const grandchildrenIds = tag.children.flatMap((childId) =>
    getAllChildrenIds(tagMap, childId),
  );

  return [...childrenIds, ...grandchildrenIds];
}

export function generateId() {
  const timestamp = Date.now();
  const randomNum = Math.random() * 1000000;
  return `${timestamp}-${Math.floor(randomNum)}`;
}

export function placeIndicator(place: number) {
  let indicator = 'th';

  if (place === 1) {
    indicator = 'st';
  } else if (place === 2) {
    indicator = 'nd';
  } else if (place === 3) {
    indicator = 'rd';
  }

  return `${place}${indicator}`;
}

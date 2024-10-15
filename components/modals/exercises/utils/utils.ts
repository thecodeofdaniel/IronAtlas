export const getAllParentIds = (tree: TagMap, id: number): number[] => {
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

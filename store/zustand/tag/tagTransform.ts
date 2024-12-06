import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { type TagStateVal } from './tagStore';

export default function transformDbTagsToState(): TagStateVal {
  const tagMap: TagMap = {
    0: {
      id: 0,
      label: 'All',
      value: 'all',
      parentId: null,
      index: 0,
      isOpen: true,
      children: [],
    },
  };
  const tagSet: Set<string> = new Set();

  try {
    const dbTags = db.select().from(schema.tag).all();

    // Insert tag objects into map
    for (const dbTag of dbTags) {
      tagMap[dbTag.id] = {
        id: dbTag.id,
        label: dbTag.label,
        value: dbTag.value,
        parentId: dbTag.parentId === null ? 0 : dbTag.parentId,
        index: dbTag.index,
        isOpen: dbTag.isOpen,
        children: [],
      };
    }

    // Second pass: populate children arrays for each tag object and sort by order
    Object.values(tagMap).forEach((tag) => {
      if (tag.parentId !== null) {
        tagMap[tag.parentId].children.push(tag.id);
      }
    });
    Object.values(tagMap).forEach((tag) => {
      tag.children.sort((a, b) => tagMap[a].index - tagMap[b].index);
    });
  } catch (error) {
    console.error('Error fetching tags from DB:', error);
  }

  return {
    tagMap,
    tagSet,
  };
}

/** If the parentId is 0, then the parentId is null in the db */
export function trueParentId(parentId: number): number | null {
  return parentId === 0 ? null : parentId;
}

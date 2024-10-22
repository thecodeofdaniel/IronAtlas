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

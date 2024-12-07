import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { eq, inArray, asc } from 'drizzle-orm';
import { FilterExerciseStateVal } from '@/store/zustand/filterExercises/filterExercisesStore';
import { TagStateVal } from '@/store/zustand/tag/tagStore';
import { getAllChildrenIds } from '@/utils/utils';

export default function filterExercises(
  tagMap: TagStateVal['tagMap'],
  selectedTags: FilterExerciseStateVal['selectedTags'],
) {
  const allTagIds = selectedTags.flatMap((tagId) => [
    +tagId,
    ...getAllChildrenIds(tagMap, +tagId),
  ]);

  return [
    ...new Set(
      db
        .select({
          exerciseId: schema.exerciseTags.exerciseId,
          index: schema.exercise.index,
        })
        .from(schema.exerciseTags)
        .innerJoin(
          schema.exercise,
          eq(schema.exerciseTags.exerciseId, schema.exercise.id),
        )
        .where(inArray(schema.exerciseTags.tagId, allTagIds))
        .orderBy(asc(schema.exercise.index))
        .all()
        .map((result) => result.exerciseId),
    ),
  ];
}

import { db } from '@/db/instance';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';
import { formatTagOrExercise } from '@/utils/utils';
import { tagTree, exercises } from './data';

const transformTagTree = (
  tree: any[],
  parentId: number | null = null
): schema.TInsertTag[] => {
  return tree.flatMap((tag, index) => {
    const children = transformTagTree(tag.children, tag.id);
    return [
      {
        id: tag.id,
        label: tag.label,
        value: formatTagOrExercise(tag.label),
        parentId: parentId,
        index: index,
        isOpen: children.length > 0,
      },
      ...children, // Include the children in the returned array
    ];
  });
};

async function createTags() {
  const startingTags = transformTagTree(tagTree);

  await db.transaction(async (trx) => {
    for (const tagData of startingTags) {
      await trx.insert(schema.tag).values(tagData);
    }
  });
}

async function createExercisesAndRelationships() {
  await db.transaction(async (trx) => {
    for (const [i, exercise] of exercises.entries()) {
      const exerciseId = i + 1;

      await trx.insert(schema.exercise).values({
        id: exerciseId,
        label: exercise.label,
        value: formatTagOrExercise(exercise.label),
        index: i,
      });

      for (const tagId of exercise.tags) {
        await trx.insert(schema.exerciseTags).values({
          exerciseId: exerciseId,
          tagId: tagId,
        });
      }
    }
  });
}

/** Return true if already seeded */
export async function seed() {
  const [exercise] = await db
    .select()
    .from(schema.exercise)
    .where(eq(schema.exercise.id, 1));

  if (exercise !== undefined) return true;

  await createTags();
  await createExercisesAndRelationships();

  return false;
}

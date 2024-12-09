import { db } from '@/db/instance';
import * as schema from '@/db/schema';
import { formatTagOrExercise } from '@/utils/utils';
import { tagTree, exercises } from './data';
import { createWorkouts } from './workouts';
import { reset } from '../reset';

async function createTags() {
  // Helper function to process one level and get IDs for the next
  async function insertLevel(
    nodes: any[],
    parentId: number | null = null,
    order: number = 0,
    trx: any,
  ) {
    for (const [index, node] of nodes.entries()) {
      // Insert current node
      const [insertedTag] = await trx
        .insert(schema.tag)
        .values({
          label: node.label,
          value: formatTagOrExercise(node.label),
          parentId: parentId,
          index: order + index,
          isOpen: node.children.length > 0,
        })
        .returning();

      // Process children with the actual parent ID
      if (node.children.length > 0) {
        await insertLevel(node.children, insertedTag.id, 0, trx);
      }
    }
  }

  await db.transaction(async (trx) => {
    await insertLevel(tagTree, null, 0, trx);
  });
}

async function createExercisesAndRelationships() {
  await db.transaction(async (trx) => {
    // First, get all tags to create a label-to-id mapping
    const allTags = await trx.select().from(schema.tag);
    const tagMap = new Map(allTags.map((tag) => [tag.label, tag.id]));

    for (const [i, exercise] of exercises.entries()) {
      // Insert exercise
      const [insertedExercise] = await trx
        .insert(schema.exercise)
        .values({
          label: exercise.label,
          value: formatTagOrExercise(exercise.label),
          index: i,
        })
        .returning();

      // Create relationships using tag labels
      for (const tagLabel of exercise.tags) {
        const tagId = tagMap.get(tagLabel);
        if (!tagId) {
          console.warn(`Tag not found: ${tagLabel}`);
          continue;
        }

        await trx.insert(schema.exerciseTags).values({
          exerciseId: insertedExercise.id,
          tagId: tagId,
        });
      }
    }
  });
}

export async function seedExercisesAndTags() {
  await reset();
  await createTags();
  await createExercisesAndRelationships();
}

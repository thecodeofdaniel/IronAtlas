import { db } from '@/db/instance';
import * as schema from './schema';

const startingTags = [
  {
    id: 1,
    label: 'Upper',
    value: 'upper',
    parentId: null,
    order: 0,
    isOpen: true,
  },
  {
    id: 2,
    label: 'Chest',
    value: 'chest',
    parentId: 1,
    order: 0,
    isOpen: false,
  },
  {
    id: 3,
    label: 'Lower',
    value: 'lower',
    parentId: null,
    order: 1,
    isOpen: false,
  },
  {
    id: 4,
    label: 'Upper Chest',
    value: 'upper_chest',
    parentId: 2,
    order: 0,
    isOpen: false,
  },
  {
    id: 5,
    label: 'Middle Chest',
    value: 'middle_chest',
    parentId: 2,
    order: 1,
    isOpen: false,
  },
  { id: 6, label: 'Arms', value: 'arms', parentId: 1, order: 1, isOpen: false },
  {
    id: 7,
    label: 'Triceps',
    value: 'triceps',
    parentId: 6,
    order: 0,
    isOpen: false,
  },
  {
    id: 8,
    label: 'Biceps',
    value: 'biceps',
    parentId: 6,
    order: 1,
    isOpen: false,
  },
];

const startingExercises = [
  {
    id: 1,
    label: 'Bench Press',
    value: 'bench_press',
    order: 0,
  },
  {
    id: 2,
    label: 'Squats',
    value: 'squats',
    order: 1,
  },
  {
    id: 3,
    label: 'Pullup',
    value: 'pullup',
    order: 2,
  },
  {
    id: 4,
    label: 'Deadlift',
    value: 'deadlift',
    order: 3,
  },
];

// "Bench Press" has "chest" and "triceps" tag
const startingRelationships = [
  {
    exerciseId: 1,
    tagId: 2,
  },
  {
    exerciseId: 1,
    tagId: 7,
  },
];

async function createTags() {
  // Insert tags
  for (const tagData of startingTags) {
    await db
      .insert(schema.tag)
      .values({
        id: tagData.id,
        label: tagData.label,
        value: tagData.value,
        parentId: tagData.parentId,
        order: tagData.order,
        isOpen: tagData.isOpen, // SQLite doesn't have a boolean type, so we use 1 for true and 0 for false
      })
      .run();
  }
}

async function createExercises() {
  for (const exerciseData of startingExercises) {
    await db.insert(schema.exercise).values({
      id: exerciseData.id,
      label: exerciseData.label,
      value: exerciseData.value,
      order: exerciseData.order,
    });
  }
}

async function createRelationships() {
  for (const relationship of startingRelationships) {
    await db.insert(schema.exerciseTags).values({
      exerciseId: relationship.exerciseId,
      tagId: relationship.tagId,
    });
  }
}

export async function seed() {
  await createTags();
  await createExercises();
  await createRelationships();
}

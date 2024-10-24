import { db } from '@/db/instance';
import * as schema from './schema';

const startingTags: schema.TInsertTag[] = [
  {
    id: 1,
    label: 'Upper',
    value: 'upper',
    parentId: null,
    index: 0,
    isOpen: true,
  },
  {
    id: 2,
    label: 'Chest',
    value: 'chest',
    parentId: 1,
    index: 0,
    isOpen: false,
  },
  {
    id: 3,
    label: 'Lower',
    value: 'lower',
    parentId: null,
    index: 1,
    isOpen: false,
  },
  {
    id: 4,
    label: 'Upper Chest',
    value: 'upper_chest',
    parentId: 2,
    index: 0,
    isOpen: false,
  },
  {
    id: 5,
    label: 'Middle Chest',
    value: 'middle_chest',
    parentId: 2,
    index: 1,
    isOpen: false,
  },
  { id: 6, label: 'Arms', value: 'arms', parentId: 1, index: 1, isOpen: false },
  {
    id: 7,
    label: 'Triceps',
    value: 'triceps',
    parentId: 6,
    index: 0,
    isOpen: false,
  },
  {
    id: 8,
    label: 'Biceps',
    value: 'biceps',
    parentId: 6,
    index: 1,
    isOpen: false,
  },
];

const startingExercises: schema.TInsertExercise[] = [
  {
    id: 1,
    label: 'Bench Press',
    value: 'bench_press',
    index: 0,
  },
  {
    id: 2,
    label: 'Squats',
    value: 'squats',
    index: 1,
  },
  {
    id: 3,
    label: 'Pullup',
    value: 'pullup',
    index: 2,
  },
  {
    id: 4,
    label: 'Deadlift',
    value: 'deadlift',
    index: 3,
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
    db.insert(schema.tag).values(tagData).run();
  }
}

async function createExercises() {
  for (const exerciseData of startingExercises) {
    db.insert(schema.exercise).values(exerciseData).run();
  }
}

async function createRelationships() {
  for (const relationship of startingRelationships) {
    await db.insert(schema.exerciseTags).values(relationship);
  }
}

export async function seed() {
  await createTags();
  await createExercises();
  await createRelationships();
}

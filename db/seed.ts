import { db } from '@/db/instance';
import * as schema from './schema';

const startingTags: schema.TInsertTag[] = [
  {
    id: 1,
    label: 'Upper Body',
    value: 'upper_body',
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
    label: 'Lower Body',
    value: 'lower_body',
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
  {
    id: 9,
    label: 'Shoulders',
    value: 'shoulders',
    parentId: 6,
    index: 2,
    isOpen: false,
  },
  {
    id: 10,
    label: 'Abs',
    value: 'abs',
    parentId: 1,
    index: 2,
    isOpen: false,
  },
  {
    id: 11,
    label: 'Back',
    value: 'back',
    parentId: 1,
    index: 3,
    isOpen: false,
  },
  {
    id: 12,
    label: 'Traps',
    value: 'traps',
    parentId: 11,
    index: 0,
    isOpen: false,
  },
  {
    id: 13,
    label: 'Quads',
    value: 'quads',
    parentId: 3,
    index: 0,
    isOpen: false,
  },
  {
    id: 14,
    label: 'Hamstrings',
    value: 'hamstrings',
    parentId: 3,
    index: 1,
    isOpen: false,
  },
  {
    id: 15,
    label: 'Glutes',
    value: 'glutes',
    parentId: 3,
    index: 2,
    isOpen: false,
  },
  {
    id: 16,
    label: 'Calves',
    value: 'calves',
    parentId: 3,
    index: 3,
    isOpen: false,
  },
  {
    id: 17,
    label: 'Lats',
    value: 'lats',
    parentId: 11,
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
  {
    id: 5,
    label: 'Pulldown',
    value: 'pulldown',
    index: 4,
  },
  {
    id: 6,
    label: 'Bicep Curls',
    value: 'bicep_curls',
    index: 5,
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
  {
    exerciseId: 6,
    tagId: 8,
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

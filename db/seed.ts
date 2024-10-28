import { db } from '@/db/instance';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import { formatTagOrExercise } from '@/utils/utils';

const tagTree = [
  {
    id: 1,
    label: 'Upper Body',
    children: [
      {
        id: 2,
        label: 'Chest',
        children: [
          {
            id: 3,
            label: 'Upper Chest',
            children: [],
          },
          {
            id: 4,
            label: 'Middle Chest',
            children: [],
          },
        ],
      },
      {
        id: 10,
        label: 'Arms',
        children: [
          {
            id: 11,
            label: 'Triceps',
            children: [],
          },
          {
            id: 12,
            label: 'Biceps',
            children: [],
          },
          {
            id: 13,
            label: 'Shoulders',
            children: [],
          },
          {
            id: 17,
            label: 'Forearms',
            children: [],
          },
        ],
      },
      {
        id: 14,
        label: 'Back',
        children: [
          {
            id: 15,
            label: 'Traps',
            children: [],
          },
          {
            id: 16,
            label: 'Lats',
            children: [],
          },
          {
            id: 18,
            label: 'Rhomboids',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 5,
    label: 'Lower Body',
    children: [
      {
        id: 6,
        label: 'Quads',
        children: [],
      },
      {
        id: 7,
        label: 'Hamstrings',
        children: [],
      },
      {
        id: 8,
        label: 'Glutes',
        children: [],
      },
      {
        id: 9,
        label: 'Calves',
        children: [],
      },
    ],
  },
];

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
        value: formatTagOrExercise(tag.label), // Use the utility function to format the value
        parentId: parentId,
        index: index,
        isOpen: children.length > 0, // Set isOpen based on whether there are children
      },
      ...children, // Include the children in the returned array
    ];
  });
};

const exercises = [
  {
    label: 'Bench Press',
    tags: [2],
  },
  {
    label: 'Squats',
    tags: [6, 7, 8],
  },
  {
    label: 'Pullup',
    tags: [16],
  },
  {
    label: 'Deadlift',
    tags: [7, 8],
  },
  {
    label: 'Pulldown',
    tags: [16],
  },
  {
    label: 'Bicep Curls',
    tags: [12],
  },
  {
    label: 'Bulgarian Split Squats',
    tags: [6, 7, 8],
  },
  {
    label: 'Leg Curl',
    tags: [7],
  },
  {
    label: 'Leg Extension',
    tags: [6],
  },
  {
    label: 'Leg Press',
    tags: [6, 7, 8],
  },
  {
    label: 'Calf Raises',
    tags: [9],
  },
  {
    label: 'Incline Dumbbell Bench Press',
    tags: [3, 11],
  },
  {
    label: 'Machine Incline Bench Press',
    tags: [3, 11],
  },
  {
    label: 'Shoulder Press',
    tags: [13],
  },
  {
    label: 'Tricep Extensions',
    tags: [11],
  },
  {
    label: 'Hammer Curls',
    tags: [12, 17],
  },
  {
    label: 'Reverse Curls',
    tags: [17],
  },
  {
    label: 'Close Grip Seated Row',
    tags: [16, 18],
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
  {
    id: 7,
    label: 'Bulgarian Split Squats',
    value: 'bulgarian_split_squats',
    index: 6,
  },
  {
    id: 8,
    label: 'Leg Curl',
    value: 'leg_curl',
    index: 7,
  },
  {
    id: 9,
    label: 'Leg Extension',
    value: 'leg_extension',
    index: 8,
  },
  {
    id: 10,
    label: 'Leg Press',
    value: 'leg_press',
    index: 9,
  },
  {
    id: 11,
    label: 'Calf Raises',
    value: 'calf_raises',
    index: 10,
  },
  {
    id: 12,
    label: 'Incline Dumbbell Bench Press',
    value: 'incline_dumbbell_bench_press',
    index: 11,
  },
  {
    id: 13,
    label: 'Machine Incline Bench Press',
    value: 'machine_incline_bench_press',
    index: 12,
  },
  {
    id: 14,
    label: 'Shoulder Press',
    value: 'shoulder_press',
    index: 13,
  },
  {
    id: 15,
    label: 'Tricep Extensions',
    value: 'tricep_extensions',
    index: 14,
  },
  {
    id: 16,
    label: 'Hammer Curls',
    value: 'hammer_curls',
    index: 15,
  },
  {
    id: 17,
    label: 'Reverse Curls',
    value: 'reverse_curls',
    index: 16,
  },
  {
    id: 18,
    label: 'Close grip Seated Row',
    value: 'close_grip_seated_row',
    index: 17,
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
  {
    exerciseId: 4,
    tagId: 14,
  },
  {
    exerciseId: 4,
    tagId: 15,
  },
  {
    exerciseId: 7,
    tagId: 13,
  },
  {
    exerciseId: 7,
    tagId: 14,
  },
  {
    exerciseId: 7,
    tagId: 15,
  },
  {
    exerciseId: 8, // leg curl
    tagId: 14,
  },
  {
    exerciseId: 9, // leg extension
    tagId: 13,
  },
  {
    exerciseId: 10,
    tagId: 13,
  },
  {
    exerciseId: 10,
    tagId: 14,
  },
  {
    exerciseId: 10,
    tagId: 15,
  },
];

async function createTags() {
  const startingTags = transformTagTree(tagTree);

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

/** Return true if already seeded */
export async function seed() {
  const [exercise] = await db
    .select()
    .from(schema.exercise)
    .where(eq(schema.exercise.id, 1));

  // if (exercise !== undefined) return true;

  await createTags();
  // await createExercises();
  // await createRelationships();

  return false;
}

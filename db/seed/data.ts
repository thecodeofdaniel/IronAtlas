export const tagTree = [
  {
    label: 'Upper Body',
    children: [
      {
        label: 'Chest',
        children: [
          {
            label: 'Upper Chest',
            children: [],
          },
          {
            label: 'Middle Chest',
            children: [],
          },
        ],
      },
      {
        label: 'Arms',
        children: [
          {
            label: 'Triceps',
            children: [],
          },
          {
            label: 'Biceps',
            children: [],
          },
          {
            label: 'Shoulders',
            children: [],
          },
          {
            label: 'Forearms',
            children: [],
          },
        ],
      },
      {
        label: 'Back',
        children: [
          {
            label: 'Traps',
            children: [],
          },
          {
            label: 'Lats',
            children: [],
          },
          {
            label: 'Rhomboids',
            children: [],
          },
        ],
      },
    ],
  },
  {
    label: 'Lower Body',
    children: [
      {
        label: 'Quads',
        children: [],
      },
      {
        label: 'Hamstrings',
        children: [],
      },
      {
        label: 'Glutes',
        children: [],
      },
      {
        label: 'Calves',
        children: [],
      },
    ],
  },
];

export const exercises = [
  {
    label: 'Bench Press',
    tags: ['Chest'],
  },
  {
    label: 'Squats',
    tags: ['Quads', 'Hamstrings', 'Glutes'],
  },
  {
    label: 'Pullup',
    tags: ['Lats'],
  },
  {
    label: 'Deadlift',
    tags: ['Hamstrings', 'Glutes'],
  },
  {
    label: 'Pulldown',
    tags: ['Lats'],
  },
  {
    label: 'Bicep Curls',
    tags: ['Biceps'],
  },
  {
    label: 'Bulgarian Split Squats',
    tags: ['Quads', 'Hamstrings', 'Glutes'],
  },
  {
    label: 'Leg Curl',
    tags: ['Hamstrings'],
  },
  {
    label: 'Leg Extension',
    tags: ['Quads'],
  },
  {
    label: 'Leg Press',
    tags: ['Quads', 'Hamstrings', 'Glutes'],
  },
  {
    label: 'Calf Raises',
    tags: ['Calves'],
  },
  {
    label: 'Incline Dumbbell Bench Press',
    tags: ['Upper Chest', 'Triceps'],
  },
  {
    label: 'Machine Incline Bench Press',
    tags: ['Upper Chest', 'Triceps'],
  },
  {
    label: 'Shoulder Press',
    tags: ['Shoulders'],
  },
  {
    label: 'Tricep Extensions',
    tags: ['Triceps'],
  },
  {
    label: 'Hammer Curls',
    tags: ['Biceps', 'Forearms'],
  },
  {
    label: 'Reverse Curls',
    tags: ['Forearms'],
  },
  {
    label: 'Close Grip Seated Row',
    tags: ['Lats', 'Rhomboids'],
  },
];

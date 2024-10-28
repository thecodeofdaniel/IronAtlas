export const tagTree = [
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

export const exercises = [
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

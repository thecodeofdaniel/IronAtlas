type Exercise = {
  id: number;
  label: string;
  value: string;
  index: number;
  // specific tag ids
  tags: Set<number>;
};

type ExerciseMap = {
  [key: number]: Exercise;
};

type Tag = {
  id: number;
  label: string;
  value: string;
  parentId: number | null;
  index: number;
  isOpen: boolean;
  children: number[];
  // exercises ids associated with tag
  exercises: Set<number>;
};

type TagMap = {
  [key: number]: Tag; // Create an ItemMap type
};

// type Workout = {
//   id: number;
//   title: string;
//   notes: string;
//   exerciseWithinWorkoutIds: number[];
//   startedAt: Date;
//   completedAt: Date;
// };

// type ExerciseWithinWorkout = {
//   id: number;
//   workoutId: number;
//   exerciseIds: number[];
//   isGroup: boolean;
//   notes: string;
//   order: number;
//   settIds: number[];
// };

// type Sett = {
//   id: number;
//   exerciseWithinWorkoutId: number;
//   exerciseId: number;
//   weight: number;
//   reps: number;
//   rpe: number;
//   order: number;
//   groupOrder: number; // this will be zero if not a group
//   type: 'normal' | 'warmup' | 'dropset';
// };

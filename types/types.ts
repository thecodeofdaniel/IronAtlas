type Exercise = {
  id: number;
  label: string;
  value: string;
  index: number;
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
};

type TagMap = {
  [key: number]: Tag;
};

type SettType = {
  type: string;
  weight: string;
  reps: string;
};

type TemplateObj = {
  exerciseId: number | null; // if exerciseId is null then it's a superset
  uuid: string;
  sets: SettType[];
  children: string[];
  parentId: string | null; // parentId should be a string
};

type TemplateMap = {
  [key: string]: TemplateObj;
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

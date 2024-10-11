type Exercise = {
  id: number;
  label: string;
  value: string;
  order: number;
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
  order: number;
  isOpen: boolean;
  children: number[]; // Store only child IDs // If child empty then it's an exercise
  // exercises ids associated with tag
  exercies: Set<number>;
};

type TagMap = {
  [key: number]: Tag; // Create an ItemMap type
};

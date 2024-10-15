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
  children: number[];
  // exercises ids associated with tag
  exercises: Set<number>;
};

type TagMap = {
  [key: number]: Tag; // Create an ItemMap type
};

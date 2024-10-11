type Exercise = {
  id: number;
  label: string;
  value: string;
};

type Tag = {
  id: number;
  label: string;
  value: string;
  parentId: number | null;
  order: number;
  isOpen: boolean;
  children: number[]; // Store only child IDs // If child empty then it's an exercise
};

type TagMap = {
  [key: number]: Tag; // Create an ItemMap type
};

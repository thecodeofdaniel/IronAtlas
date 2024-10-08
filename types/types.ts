type Exercise = {
  id: number;
  title: string;
};

type Tag = {
  id: number;
  title: string;
  parentId: number | null;
  order: number;
  isOpen: boolean;
  children: number[]; // Store only child IDs // If child empty then it's an exercise
};

type TagMap = {
  [key: number]: Tag; // Create an ItemMap type
};

type DatePointer = {
  year: number;
  month: number;
  date: number;
};

type FlatDate = DatePointer & {
  day: number;
  toString(): string;
};

type Day = {
  date: FlatDate;
  today?: boolean;
  outOfRange?: boolean;
  selected?: boolean;
  available?: number;
};

type ComparisonResult = -1 | 0 | 1;
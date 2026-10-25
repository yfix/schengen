export type Ord = number;

export type DateParts = {
  year: number;
  month: number;
  date: number;
  weekday: number;
};

const MS_PER_DAY = 86_400_000;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const toOrd = (year: number, month: number, date: number): Ord =>
  Math.round(Date.UTC(year, month, date) / MS_PER_DAY);

export const ordToUtcDate = (ord: Ord) => new Date(ord * MS_PER_DAY);

export const fromOrd = (ord: Ord): DateParts => {
  const d = ordToUtcDate(ord);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    date: d.getUTCDate(),
    weekday: d.getUTCDay(),
  };
};

export const localToday = (now: Date = new Date()): Ord =>
  toOrd(now.getFullYear(), now.getMonth(), now.getDate());

const pad = (n: number) => String(n).padStart(2, '0');

export const toIso = (ord: Ord): string => {
  const { year, month, date } = fromOrd(ord);
  return `${year}-${pad(month + 1)}-${pad(date)}`;
};

export const parseIso = (value: string): Ord | null => {
  const m = ISO_RE.exec(value.trim());
  if (!m) return null;
  const [year, month, date] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const ord = toOrd(year, month, date);
  const back = fromOrd(ord);
  return back.year === year && back.month === month && back.date === date ? ord : null;
};

export const startOfMonth = (ord: Ord): Ord => {
  const { year, month } = fromOrd(ord);
  return toOrd(year, month, 1);
};

export const endOfMonth = (ord: Ord): Ord => {
  const { year, month } = fromOrd(ord);
  return toOrd(year, month + 1, 0);
};

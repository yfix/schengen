import type { Ord } from './engine/dates';

const asDate = (ord: Ord) => new Date(ord * 86_400_000);

const dayFmt = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const monthFmt = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const weekdayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' });

export const formatDay = (ord: Ord) => dayFmt.format(asDate(ord));
export const formatMonth = (ord: Ord) => monthFmt.format(asDate(ord));

const MONDAY_2024_01_01 = 19723;
export const weekdayNames = Array.from({ length: 7 }, (_, i) =>
  weekdayFmt.format(asDate(MONDAY_2024_01_01 + i)),
);

export const plural = (n: number, word: string) => `${n} ${word}${Math.abs(n) === 1 ? '' : 's'}`;

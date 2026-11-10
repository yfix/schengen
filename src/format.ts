import { ordToUtcDate as asDate, toOrd, type Ord } from './engine/dates';

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

const SUNDAY_2024_01_07 = toOrd(2024, 0, 7);
export const weekdayNames = (weekStart: number) =>
  Array.from({ length: 7 }, (_, i) => weekdayFmt.format(asDate(SUNDAY_2024_01_07 + weekStart + i)));

type WeekInfo = { firstDay: number };
type LocaleWithWeek = Intl.Locale & { getWeekInfo?: () => WeekInfo; weekInfo?: WeekInfo };

export const localeWeekStart = (locale?: string): number => {
  try {
    const loc = new Intl.Locale(
      locale ?? new Intl.DateTimeFormat().resolvedOptions().locale,
    ) as LocaleWithWeek;
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    return info ? info.firstDay % 7 : 1;
  } catch {
    return 1;
  }
};

export const plural = (n: number, word: string) => `${n} ${word}${Math.abs(n) === 1 ? '' : 's'}`;

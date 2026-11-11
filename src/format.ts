import { ordToUtcDate as asDate, toOrd, type Ord } from './engine/dates';

const SUNDAY_2024_01_07 = toOrd(2024, 0, 7);

export const createFormat = (locale?: string) => {
  const dayFmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const monthFmt = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  return {
    day: (ord: Ord) => dayFmt.format(asDate(ord)),
    month: (ord: Ord) => monthFmt.format(asDate(ord)),
    weekdays: (weekStart: number) =>
      Array.from({ length: 7 }, (_, i) =>
        weekdayFmt.format(asDate(SUNDAY_2024_01_07 + weekStart + i)),
      ),
  };
};

export type Format = ReturnType<typeof createFormat>;

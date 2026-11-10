import { describe, expect, it } from 'vitest';
import { toOrd } from './engine/dates';
import { formatDay, formatMonth, localeWeekStart, plural, weekdayNames } from './format';

describe('format', () => {
  it('pluralizes English nouns', () => {
    expect(plural(0, 'day')).toBe('0 days');
    expect(plural(1, 'day')).toBe('1 day');
    expect(plural(-1, 'day')).toBe('-1 day');
    expect(plural(2, 'day')).toBe('2 days');
  });

  it('lists seven weekdays from the given start', () => {
    const short = (d: Date) => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d);
    for (const start of [0, 1, 6]) {
      const names = weekdayNames(start);
      expect(names).toHaveLength(7);
      expect(new Set(names).size).toBe(7);
      expect(names[0]).toBe(short(new Date(2024, 0, 7 + start)));
    }
  });

  it('reads the first day of the week from the locale', () => {
    expect(localeWeekStart('en-US')).toBe(0);
    expect(localeWeekStart('de-DE')).toBe(1);
    expect(localeWeekStart('ar-EG')).toBe(6);
    expect(localeWeekStart('not a locale')).toBe(1);
    expect(localeWeekStart()).toBeGreaterThanOrEqual(0);
  });

  it('formats ordinals as the same calendar day in any time zone', () => {
    const ord = toOrd(2026, 0, 1);
    expect(formatDay(ord)).toBe(
      new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(2026, 0, 1)),
    );
    expect(formatMonth(ord)).toContain('2026');
  });
});

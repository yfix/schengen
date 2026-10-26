import { describe, expect, it } from 'vitest';
import { toOrd } from './engine/dates';
import { formatDay, formatMonth, plural, weekdayNames } from './format';

describe('format', () => {
  it('pluralizes English nouns', () => {
    expect(plural(0, 'day')).toBe('0 days');
    expect(plural(1, 'day')).toBe('1 day');
    expect(plural(-1, 'day')).toBe('-1 day');
    expect(plural(2, 'day')).toBe('2 days');
  });

  it('lists seven weekdays starting on Monday', () => {
    expect(weekdayNames).toHaveLength(7);
    expect(new Set(weekdayNames).size).toBe(7);
    expect(weekdayNames[0]).toBe(
      new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(2024, 0, 1)),
    );
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

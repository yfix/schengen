import { describe, expect, it } from 'vitest';
import { endOfMonth, fromOrd, localToday, parseIso, startOfMonth, toIso, toOrd } from './dates';

const T = toOrd(2026, 9, 25);

describe('dates', () => {
  it('round-trips ordinals through leap days and DST changes', () => {
    for (const [y, m, d] of [
      [2024, 1, 29],
      [2026, 2, 29],
      [2026, 9, 25],
      [1999, 11, 31],
    ] as const) {
      const ord = toOrd(y, m, d);
      expect(fromOrd(ord)).toMatchObject({ year: y, month: m, date: d });
      expect(parseIso(toIso(ord))).toBe(ord);
    }
    expect(toOrd(2026, 2, 30) - toOrd(2026, 2, 29)).toBe(1);
  });

  it('parses ISO dates as local calendar days, not UTC instants (B2)', () => {
    expect(fromOrd(parseIso('2025-07-21')!)).toMatchObject({ year: 2025, month: 6, date: 21 });
    expect(parseIso('2025-02-30')).toBeNull();
    expect(parseIso('21.07.2025')).toBeNull();
  });

  it('trims input and rejects malformed or out-of-range parts', () => {
    expect(parseIso('  2026-10-25\r')).toBe(T);
    for (const bad of [
      '2026-13-01',
      '2026-00-10',
      '2026-10-32',
      '2026-1-05',
      '2026-10-25T00:00',
      '',
    ])
      expect(parseIso(bad)).toBeNull();
    expect(parseIso('2024-02-29')).toBe(toOrd(2024, 1, 29));
    expect(parseIso('2025-02-29')).toBeNull();
  });

  it('zero-pads month and day in ISO output', () => {
    expect(toIso(toOrd(2026, 0, 5))).toBe('2026-01-05');
    expect(toIso(toOrd(2026, 11, 31))).toBe('2026-12-31');
  });

  it('normalizes overflowing parts like Date.UTC', () => {
    expect(toOrd(2026, 12, 1)).toBe(toOrd(2027, 0, 1));
    expect(toOrd(2026, 2, 0)).toBe(toOrd(2026, 1, 28));
  });

  it('reports weekdays with Sunday = 0', () => {
    expect(fromOrd(toOrd(2024, 0, 1)).weekday).toBe(1);
    expect(fromOrd(toOrd(2026, 9, 25)).weekday).toBe(0);
  });

  it('finds month bounds, including February in leap years', () => {
    expect(startOfMonth(T)).toBe(toOrd(2026, 9, 1));
    expect(endOfMonth(T)).toBe(toOrd(2026, 9, 31));
    expect(endOfMonth(toOrd(2024, 1, 10))).toBe(toOrd(2024, 1, 29));
    expect(endOfMonth(toOrd(2026, 1, 10))).toBe(toOrd(2026, 1, 28));
    expect(endOfMonth(toOrd(2026, 11, 31))).toBe(toOrd(2026, 11, 31));
    expect(startOfMonth(toOrd(2027, 0, 1))).toBe(toOrd(2027, 0, 1));
  });

  it('takes today from the local clock', () => {
    expect(localToday(new Date(2026, 9, 25, 23, 59))).toBe(T);
    expect(localToday(new Date(2026, 9, 26, 0, 1))).toBe(T + 1);
  });

  it('keeps one ordinal per local day across DST transitions', () => {
    expect(localToday(new Date(2026, 2, 8, 1, 30))).toBe(toOrd(2026, 2, 8));
    expect(localToday(new Date(2026, 2, 8, 3, 30))).toBe(toOrd(2026, 2, 8));
    expect(localToday(new Date(2026, 10, 1, 23, 30))).toBe(toOrd(2026, 10, 1));
  });
});

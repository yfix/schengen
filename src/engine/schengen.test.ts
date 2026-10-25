import { describe, expect, it } from 'vitest';
import { fromOrd, localToday, parseIso, toIso, toOrd, type Ord } from './dates';
import { analyze, earliestEntry, visibleRange, type Rules } from './schengen';
import { parseRanges } from './ranges';

const rules: Rules = { window: 180, max: 90 };
const T = toOrd(2026, 9, 25);
const span = (start: Ord, length: number) => Array.from({ length }, (_, i) => start + i);

const naiveCount = (sel: Set<Ord>, day: Ord, r: Rules) =>
  span(day - r.window + 1, r.window).filter((d) => sel.has(d)).length;

const naiveStay = (sel: Set<Ord>, day: Ord, r: Rules) => {
  let k = 0;
  for (;;) {
    const next = new Set([...sel, ...span(day, k + 1)]);
    const ok = span(day, k + r.window).every((t) => naiveCount(next, t, r) <= r.max);
    if (!ok || k >= r.max) return k;
    k++;
  }
};

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

  it('takes today from the local clock', () => {
    expect(localToday(new Date(2026, 9, 25, 23, 59))).toBe(T);
    expect(localToday(new Date(2026, 9, 26, 0, 1))).toBe(T + 1);
  });
});

describe('analyze', () => {
  it('counts only the window ending on the day (B6, B7)', () => {
    const sel = new Set([T - 180, T - 179, T, T + 5]);
    const a = analyze(sel, T - 200, T + 200, rules);
    expect(a.count(T)).toBe(2);
    expect(a.count(T + 5)).toBe(2);
    expect(a.remaining(T)).toBe(88);
  });

  it('90 days ending today: no days left, next entry after 90 more days', () => {
    const sel = new Set(span(T - 89, 90));
    const a = analyze(sel, T - 200, T + 400, rules);
    expect(a.remaining(T)).toBe(0);
    expect(a.stayFrom(T + 1)).toBe(0);
    expect(earliestEntry(a, T + 1)).toBe(T + 91);
    expect(a.stayFrom(T + 91)).toBe(90);
    expect(a.stayFrom(T + 180)).toBe(90);
    expect(a.overstays).toEqual([]);
  });

  it('flags every day past the limit as an overstay', () => {
    const sel = new Set(span(T, 92));
    const a = analyze(sel, T - 10, T + 300, rules);
    expect(a.overstays).toEqual([T + 90, T + 91]);
  });

  it('does not crash with a full stay at the end of the range (B3)', () => {
    const { from, to } = visibleRange(T, rules, 4);
    const sel = new Set(span(to - 89, 90));
    const a = analyze(sel, from, to, rules);
    expect(a.overstays).toEqual([]);
    expect(a.stayFrom(to - 100)).toBe(0);
  });

  it('matches a brute-force oracle on random selections (B11)', () => {
    const small: Rules = { window: 20, max: 10 };
    let seed = 7;
    const rand = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
    for (let run = 0; run < 40; run++) {
      const from = 1000;
      const to = 1080;
      const sel = new Set(span(from - 19, 120).filter(() => rand() < 0.25));
      const a = analyze(sel, from, to, small);
      for (let d = from; d <= to; d++) {
        expect(a.count(d)).toBe(naiveCount(sel, d, small));
        if (d <= to - small.window) expect(a.stayFrom(d)).toBe(naiveStay(sel, d, small));
      }
    }
  });
});

describe('parseRanges', () => {
  it('reads ranges, single days and separators', () => {
    const { days, errors } = parseRanges(
      '2026-07-21 2026-07-23\n\n2026-08-01\n2026-08-03 – 2026-08-04',
    );
    expect(errors).toEqual([]);
    expect(days.map(toIso)).toEqual([
      '2026-07-21',
      '2026-07-22',
      '2026-07-23',
      '2026-08-01',
      '2026-08-03',
      '2026-08-04',
    ]);
  });

  it('reports bad lines', () => {
    expect(parseRanges('2026-08-05 2026-08-01\nnope').errors).toEqual([1, 2]);
  });
});

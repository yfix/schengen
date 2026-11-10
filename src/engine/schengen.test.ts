import { describe, expect, it } from 'vitest';
import { endOfMonth, startOfMonth, toOrd, type Ord } from './dates';
import { analyze, earliestEntry, visibleRange, type Rules } from './schengen';

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

const naiveOverstays = (sel: Set<Ord>, from: Ord, to: Ord, r: Rules) =>
  span(from, to - from + 1).filter((d) => sel.has(d) && naiveCount(sel, d, r) > r.max);

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
      expect(a.overstays).toEqual(naiveOverstays(sel, from, to, small));
    }
  });

  it('allows a full stay with nothing selected', () => {
    const a = analyze(new Set(), T - 10, T + 400, rules);
    expect(a.count(T)).toBe(0);
    expect(a.remaining(T)).toBe(90);
    expect(a.stayFrom(T)).toBe(90);
    expect(a.overstays).toEqual([]);
  });

  it('goes negative on remaining days during an overstay', () => {
    const a = analyze(new Set(span(T, 95)), T, T + 300, rules);
    expect(a.remaining(T + 94)).toBe(-5);
    expect(a.overstays).toHaveLength(5);
  });

  it('ignores selected days outside the analysed span', () => {
    const sel = new Set([T - 10_000, T + 10_000, T]);
    const a = analyze(sel, T - 10, T + 10, rules);
    expect(a.count(T)).toBe(1);
    expect(a.count(T + 10)).toBe(1);
  });

  it('counts days that fall out of the window as freed up', () => {
    const sel = new Set(span(T - 179, 90));
    const a = analyze(sel, T - 10, T + 200, rules);
    expect(a.count(T)).toBe(90);
    expect(a.count(T + 1)).toBe(89);
    expect(a.stayFrom(T + 1)).toBe(90);
    expect(a.count(T + 90)).toBe(0);
  });

  it('limits a stay by future planned trips, not only past ones', () => {
    const sel = new Set(span(T + 30, 80));
    const a = analyze(sel, T - 10, T + 400, rules);
    expect(a.stayFrom(T)).toBe(10);
    expect(a.stayFrom(T + 200)).toBe(90);
  });

  it('honours custom rules', () => {
    const r: Rules = { window: 30, max: 15 };
    const a = analyze(new Set(span(T - 9, 10)), T - 40, T + 100, r);
    expect(a.remaining(T)).toBe(5);
    expect(a.stayFrom(T + 1)).toBe(5);
    expect(earliestEntry(a, T + 1)).toBe(T + 1);
  });

  it('memoizes stayFrom per day', () => {
    const a = analyze(new Set(span(T - 50, 40)), T - 10, T + 200, rules);
    const first = a.stayFrom(T + 3);
    expect(a.stayFrom(T + 3)).toBe(first);
  });
});

describe('earliestEntry', () => {
  it('returns the start day when entry is possible', () => {
    const a = analyze(new Set(), T, T + 10, rules);
    expect(earliestEntry(a, T + 2)).toBe(T + 2);
  });

  it('returns null when no entry fits before the end of the range', () => {
    const a = analyze(new Set(span(T - 89, 90)), T - 10, T + 30, rules);
    expect(earliestEntry(a, T + 1)).toBeNull();
  });
});

describe('visibleRange', () => {
  it('starts at the month of the first relevant day and ends at a month end', () => {
    const r = visibleRange(T, rules, 4);
    expect(r.firstRelevant).toBe(T - 179);
    expect(r.from).toBe(startOfMonth(T - 179));
    expect(r.to).toBe(endOfMonth(T + 720));
    expect(r.from).toBeLessThanOrEqual(r.firstRelevant);
  });

  it('scales with the number of windows ahead', () => {
    expect(visibleRange(T, rules, 1).to).toBe(endOfMonth(T + 180));
    expect(visibleRange(T, { window: 30, max: 15 }, 2).to).toBe(endOfMonth(T + 60));
  });
});

import { endOfMonth, startOfMonth, type Ord } from './dates';

export type Rules = {
  window: number;
  max: number;
};

export type Analysis = {
  from: Ord;
  to: Ord;
  count: (day: Ord) => number;
  remaining: (day: Ord) => number;
  stayFrom: (day: Ord) => number;
  overstays: Ord[];
};

export const visibleRange = (today: Ord, rules: Rules, windowsAhead: number) => ({
  from: startOfMonth(today - rules.window + 1),
  firstRelevant: today - rules.window + 1,
  to: endOfMonth(today + rules.window * windowsAhead),
});

export const analyze = (selected: ReadonlySet<Ord>, from: Ord, to: Ord, rules: Rules): Analysis => {
  const { window, max } = rules;
  const base = from - window + 1;
  const tail = to + window;
  const size = tail - base + 1;
  const present = new Uint8Array(size);
  for (const day of selected) if (day >= base && day <= tail) present[day - base] = 1;

  const prefix = new Int32Array(size + 1);
  for (let i = 0; i < size; i++) prefix[i + 1] = prefix[i]! + present[i]!;

  const idx = (day: Ord) => Math.min(Math.max(day - base, -1), size - 1);
  const used = (start: Ord, end: Ord) => prefix[idx(end) + 1]! - prefix[idx(start - 1) + 1]!;
  const count = (day: Ord) => used(day - window + 1, day);
  const isPresent = (day: Ord) => day >= base && day <= tail && present[day - base] === 1;

  const fits = (start: Ord, length: number) => {
    const end = start + length - 1;
    for (let t = start; t <= end + window - 1; t++) {
      const lo = Math.max(start, t - window + 1);
      const hi = Math.min(end, t);
      const added = hi >= lo ? hi - lo + 1 - used(lo, hi) : 0;
      if (count(t) + added > max) return false;
    }
    return true;
  };

  const stayCache = new Map<Ord, number>();
  const stayFrom = (day: Ord) => {
    const cached = stayCache.get(day);
    if (cached !== undefined) return cached;
    let lo = 0;
    let hi = max;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (fits(day, mid)) lo = mid;
      else hi = mid - 1;
    }
    stayCache.set(day, lo);
    return lo;
  };

  const overstays: Ord[] = [];
  for (let day = from; day <= to; day++) {
    if (isPresent(day) && count(day) > max) overstays.push(day);
  }

  return {
    from,
    to,
    count,
    remaining: (day) => max - count(day),
    stayFrom,
    overstays,
  };
};

export const earliestEntry = (analysis: Analysis, after: Ord): Ord | null => {
  for (let day = after; day <= analysis.to; day++) if (analysis.stayFrom(day) > 0) return day;
  return null;
};

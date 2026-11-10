import { parseIso, type Ord } from './dates';

export type ParsedRanges = { days: Ord[]; errors: number[] };

export const parseRanges = (text: string): ParsedRanges => {
  const days: Ord[] = [];
  const errors: number[] = [];
  text.split('\n').forEach((line, i) => {
    const parts = line
      .replace(/\s+[–—-]\s+/g, ' ')
      .trim()
      .split(/[\s,;]+/)
      .filter(Boolean);
    if (parts.length === 0) return;
    const start = parseIso(parts[0]!);
    const end = parts.length > 1 ? parseIso(parts[1]!) : start;
    if (start === null || end === null || end < start || parts.length > 2) {
      errors.push(i + 1);
      return;
    }
    for (let d = start; d <= end; d++) days.push(d);
  });
  return { days, errors };
};

export type Trip = { start: Ord; end: Ord };

export const toTrips = (days: Iterable<Ord>): Trip[] => {
  const trips: Trip[] = [];
  for (const day of [...days].sort((a, b) => a - b)) {
    const last = trips.at(-1);
    if (last && day === last.end + 1) last.end = day;
    else if (!last || day > last.end) trips.push({ start: day, end: day });
  }
  return trips;
};

export const tripLength = (trip: Trip) => trip.end - trip.start + 1;

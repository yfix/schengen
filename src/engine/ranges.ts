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

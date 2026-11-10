import { parseIso, toIso, type Ord } from './dates';
import { toTrips, type Trip } from './ranges';
import type { Rules } from './schengen';

const compact = (ord: Ord) => toIso(ord).replaceAll('-', '');
const expand = (s: string) =>
  /^\d{8}$/.test(s) ? parseIso(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`) : null;

const spread = (trips: Trip[]) => {
  const days: Ord[] = [];
  for (const { start, end } of trips) for (let d = start; d <= end; d++) days.push(d);
  return days;
};

const MAX_DAYS = 10_000;

const checked = (trips: Trip[]): Ord[] | null => {
  let total = 0;
  for (const { start, end } of trips) {
    if (end < start) return null;
    total += end - start + 1;
    if (total > MAX_DAYS) return null;
  }
  return spread(trips);
};

export const encodeTrips = (days: Iterable<Ord>) =>
  toTrips(days)
    .map(({ start, end }) => (start === end ? compact(start) : `${compact(start)}-${compact(end)}`))
    .join('.');

export const decodeTrips = (value: string): Ord[] | null => {
  if (!value) return [];
  const trips: Trip[] = [];
  for (const part of value.split('.')) {
    const [a, b, extra] = part.split('-');
    const start = expand(a ?? '');
    const end = b === undefined ? start : expand(b);
    if (start === null || end === null || extra !== undefined) return null;
    trips.push({ start, end });
  }
  return checked(trips);
};

export const SHARE_PARAM = 't';

export const shareUrl = (href: string, days: Iterable<Ord>) => {
  const url = new URL(href);
  url.hash = `${SHARE_PARAM}=${encodeTrips(days)}`;
  return url.toString();
};

export const readShareHash = (hash: string): Ord[] | null => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const value = params.get(SHARE_PARAM);
  return value === null ? null : decodeTrips(value);
};

export type ExportFile = {
  app: 'schengen';
  version: 1;
  rules: Rules;
  trips: { start: string; end: string }[];
};

export const toExport = (days: Iterable<Ord>, rules: Rules): ExportFile => ({
  app: 'schengen',
  version: 1,
  rules: { window: rules.window, max: rules.max },
  trips: toTrips(days).map(({ start, end }) => ({ start: toIso(start), end: toIso(end) })),
});

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export const parseExport = (text: string): Ord[] | null => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(data) || data.app !== 'schengen' || data.version !== 1) return null;
  if (!Array.isArray(data.trips)) return null;
  const trips: Trip[] = [];
  for (const t of data.trips as unknown[]) {
    if (!isRecord(t) || typeof t.start !== 'string' || typeof t.end !== 'string') return null;
    const start = parseIso(t.start);
    const end = parseIso(t.end);
    if (start === null || end === null) return null;
    trips.push({ start, end });
  }
  return checked(trips);
};

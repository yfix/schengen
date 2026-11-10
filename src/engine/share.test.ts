import { describe, expect, it } from 'vitest';
import { toOrd } from './dates';
import { decodeTrips, encodeTrips, parseExport, readShareHash, shareUrl, toExport } from './share';

const d = (m: number, day: number) => toOrd(2026, m, day);
const days = [d(6, 21), d(6, 22), d(6, 23), d(9, 4)];
const rules = { window: 180, max: 90 };

describe('share link', () => {
  it('round-trips trips compactly', () => {
    const encoded = encodeTrips(days);
    expect(encoded).toBe('20260721-20260723.20261004');
    expect(decodeTrips(encoded)).toEqual(days);
    expect(decodeTrips('')).toEqual([]);
  });

  it('rejects malformed values', () => {
    for (const bad of ['2026', '20260231', '20260723-20260721', '20260101-20260102-20260103', 'x'])
      expect(decodeTrips(bad)).toBeNull();
    expect(decodeTrips('20000101-20990101')).toBeNull();
  });

  it('builds and reads the hash', () => {
    const url = shareUrl('https://example.test/schengen/?range=180#old', days);
    expect(url).toBe('https://example.test/schengen/?range=180#t=20260721-20260723.20261004');
    expect(readShareHash(new URL(url).hash)).toEqual(days);
    expect(readShareHash('#other=1')).toBeNull();
    expect(readShareHash('')).toBeNull();
  });
});

describe('JSON export', () => {
  it('round-trips through JSON', () => {
    const file = toExport(days, rules);
    expect(file.trips).toEqual([
      { start: '2026-07-21', end: '2026-07-23' },
      { start: '2026-10-04', end: '2026-10-04' },
    ]);
    expect(parseExport(JSON.stringify(file))).toEqual(days);
  });

  it('rejects foreign or broken files', () => {
    const ok = toExport(days, rules);
    for (const bad of [
      'not json',
      'null',
      JSON.stringify({ ...ok, app: 'other' }),
      JSON.stringify({ ...ok, version: 2 }),
      JSON.stringify({ ...ok, trips: 'x' }),
      JSON.stringify({ ...ok, trips: [{ start: 1, end: 2 }] }),
      JSON.stringify({ ...ok, trips: [{ start: '2026-02-30', end: '2026-03-01' }] }),
      JSON.stringify({ ...ok, trips: [{ start: '2026-03-02', end: '2026-03-01' }] }),
    ])
      expect(parseExport(bad)).toBeNull();
  });
});

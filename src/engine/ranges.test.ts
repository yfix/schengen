import { describe, expect, it } from 'vitest';
import { toIso } from './dates';
import { parseRanges } from './ranges';

const iso = (text: string) => parseRanges(text).days.map(toIso);

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

  it('accepts commas, semicolons, dashes and CRLF line endings', () => {
    expect(
      iso('2026-01-01,2026-01-02\r\n2026-02-01; 2026-02-02\r\n2026-03-01 - 2026-03-01'),
    ).toEqual(['2026-01-01', '2026-01-02', '2026-02-01', '2026-02-02', '2026-03-01']);
    expect(iso('2026-04-01 — 2026-04-02')).toEqual(['2026-04-01', '2026-04-02']);
  });

  it('crosses month and year boundaries', () => {
    expect(iso('2026-12-30 2027-01-02')).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
  });

  it('rejects extra parts and invalid dates but keeps good lines', () => {
    const { days, errors } = parseRanges(
      '2026-01-01 2026-01-02 2026-01-03\n2026-02-30\n2026-05-05\n   \n2026-05-06 bad',
    );
    expect(errors).toEqual([1, 2, 5]);
    expect(days.map(toIso)).toEqual(['2026-05-05']);
  });

  it('returns nothing for empty input', () => {
    expect(parseRanges('')).toEqual({ days: [], errors: [] });
    expect(parseRanges('\n \n')).toEqual({ days: [], errors: [] });
  });
});

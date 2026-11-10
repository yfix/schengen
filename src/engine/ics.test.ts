import { describe, expect, it } from 'vitest';
import { toOrd } from './dates';
import { toIcs } from './ics';

const now = new Date(Date.UTC(2026, 10, 10, 12, 30, 5, 123));

describe('toIcs', () => {
  it('writes one all-day event per trip with an exclusive end', () => {
    const d = (m: number, day: number) => toOrd(2026, m, day);
    const ics = toIcs([d(6, 30), d(6, 31), d(7, 1), d(9, 4)], now);
    const lines = ics.split('\r\n');
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(lines[0]).toBe('BEGIN:VCALENDAR');
    expect(lines.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(2);
    expect(lines).toContain('DTSTART;VALUE=DATE:20260730');
    expect(lines).toContain('DTEND;VALUE=DATE:20260802');
    expect(lines).toContain('SUMMARY:Schengen trip (3 days)');
    expect(lines).toContain('DTEND;VALUE=DATE:20261005');
    expect(lines).toContain('SUMMARY:Schengen trip (1 day)');
    expect(lines).toContain('UID:20260730-20260801@schengen');
    expect(lines).toContain('DTSTAMP:20261110T123005Z');
    expect(lines.at(-2)).toBe('END:VCALENDAR');
  });

  it('writes an empty calendar with no trips', () => {
    expect(toIcs([], now)).not.toContain('VEVENT');
  });
});

import { toIso, type Ord } from './dates';
import { toTrips, tripLength } from './ranges';

const icsDate = (ord: Ord) => toIso(ord).replaceAll('-', '');
const stamp = (now: Date) =>
  now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

export const toIcs = (days: Iterable<Ord>, now: Date = new Date()): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//yfix//schengen//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Schengen trips',
  ];
  for (const trip of toTrips(days)) {
    const n = tripLength(trip);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsDate(trip.start)}-${icsDate(trip.end)}@schengen`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${icsDate(trip.start)}`,
      `DTEND;VALUE=DATE:${icsDate(trip.end + 1)}`,
      `SUMMARY:Schengen trip (${n} day${n === 1 ? '' : 's'})`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
};

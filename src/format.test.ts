import { describe, expect, it } from 'vitest';
import { toOrd } from './engine/dates';
import { createFormat } from './format';

describe('format', () => {
  it('lists seven weekdays from the given start', () => {
    const fmt = createFormat('en-GB');
    expect(fmt.weekdays(1)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(fmt.weekdays(0)[0]).toBe('Sun');
    expect(createFormat('uk-UA').weekdays(1)[0]).toBe('пн');
  });

  it('formats ordinals as the same calendar day in any time zone', () => {
    const ord = toOrd(2026, 0, 1);
    const fmt = createFormat('en-GB');
    expect(fmt.day(ord)).toBe('1 Jan 2026');
    expect(fmt.month(ord)).toBe('January 2026');
    expect(createFormat('uk-UA').month(ord)).toMatch(/2026/);
  });
});

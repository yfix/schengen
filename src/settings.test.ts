import { describe, expect, it } from 'vitest';
import { parseSettings } from './settings';

describe('settings (B9)', () => {
  it('defaults and clamps URL params', () => {
    expect(parseSettings('')).toMatchObject({ window: 180, max: 90, windowsAhead: 4 });
    expect(parseSettings('?range=abc&max=-3&repeat=99')).toMatchObject({
      window: 180,
      max: 1,
      windowsAhead: 10,
    });
    expect(parseSettings('?range=30')).toMatchObject({ window: 30, max: 15, windowsAhead: 4 });
  });

  it('keeps max below the window', () => {
    expect(parseSettings('?range=10&max=50')).toMatchObject({
      window: 10,
      max: 9,
      windowsAhead: 4,
    });
  });

  it('clamps the window to 2..730', () => {
    expect(parseSettings('?range=1').window).toBe(2);
    expect(parseSettings('?range=1').max).toBe(1);
    expect(parseSettings('?range=5000').window).toBe(730);
  });

  it('reads ?week= or leaves the week start unset', () => {
    expect(parseSettings('').weekStart).toBeNull();
    expect(parseSettings('?week=abc').weekStart).toBeNull();
    expect(parseSettings('?week=0').weekStart).toBe(0);
    expect(parseSettings('?week=9').weekStart).toBe(6);
  });

  it('falls back on non-integer values', () => {
    expect(parseSettings('?range=90.5&max=&repeat=1e1')).toMatchObject({
      window: 180,
      max: 90,
      windowsAhead: 10,
    });
    expect(parseSettings('?repeat=0').windowsAhead).toBe(1);
  });
});

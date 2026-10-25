import { describe, expect, it } from 'vitest';
import { parseIso, toOrd } from '../engine/dates';
import { parseSettings } from '../settings';
import { createSelectionStore } from './selection';

describe('selection store', () => {
  it('migrates the legacy {year, month, date} format to v2 ISO strings', () => {
    localStorage.setItem(
      'schengen/selectedDates',
      JSON.stringify([
        { year: 2026, month: 9, date: 1, day: 4 },
        { year: 2026, month: 9, date: 2 },
        'junk',
      ]),
    );
    const store = createSelectionStore();
    expect([...store.get()].sort()).toEqual([toOrd(2026, 9, 1), toOrd(2026, 9, 2)]);
    expect(localStorage.getItem('schengen/selectedDates')).toBeNull();
    expect(JSON.parse(localStorage.getItem('schengen/v2/days')!)).toEqual([
      '2026-10-01',
      '2026-10-02',
    ]);
  });

  it('survives corrupt storage (B10)', () => {
    localStorage.setItem('schengen/v2/days', '{not json');
    expect(createSelectionStore().get().size).toBe(0);
  });

  it('toggles, adds, prunes and notifies', () => {
    const store = createSelectionStore();
    let calls = 0;
    store.subscribe(() => calls++);
    const d = parseIso('2026-10-25')!;
    store.toggle(d);
    store.add([d - 200, d + 1]);
    store.prune(d - 179);
    expect([...store.get()].sort()).toEqual([d, d + 1]);
    store.toggle(d);
    expect([...store.get()]).toEqual([d + 1]);
    expect(calls).toBe(4);
  });
});

describe('settings (B9)', () => {
  it('defaults and clamps URL params', () => {
    expect(parseSettings('')).toEqual({ window: 180, max: 90, windowsAhead: 4 });
    expect(parseSettings('?range=abc&max=-3&repeat=99')).toEqual({
      window: 180,
      max: 1,
      windowsAhead: 10,
    });
    expect(parseSettings('?range=30')).toEqual({ window: 30, max: 15, windowsAhead: 4 });
  });
});

import { describe, expect, it } from 'vitest';
import { parseIso, toOrd } from '../engine/dates';
import { sorted } from '../test/renderApp';
import { createSelectionStore, selectionStore } from './selection';

const d = parseIso('2026-10-25')!;
const stored = () => JSON.parse(localStorage.getItem('schengen/v2/days') ?? 'null') as unknown;

describe('selection storage', () => {
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
    expect(sorted(store.get())).toEqual([toOrd(2026, 9, 1), toOrd(2026, 9, 2)]);
    expect(localStorage.getItem('schengen/selectedDates')).toBeNull();
    expect(stored()).toEqual(['2026-10-01', '2026-10-02']);
  });

  it('skips legacy entries with missing or non-integer fields', () => {
    localStorage.setItem(
      'schengen/selectedDates',
      JSON.stringify([
        { year: 2026, month: 9 },
        { year: 2026, month: 9, date: 1.5 },
        { year: '2026', month: 9, date: 3 },
        null,
        { year: 2026, month: 9, date: 4 },
      ]),
    );
    expect(sorted(createSelectionStore().get())).toEqual([toOrd(2026, 9, 4)]);
  });

  it('drops a non-array legacy value and writes an empty v2 list', () => {
    localStorage.setItem('schengen/selectedDates', JSON.stringify({ year: 2026 }));
    expect(createSelectionStore().get().size).toBe(0);
    expect(localStorage.getItem('schengen/selectedDates')).toBeNull();
    expect(stored()).toEqual([]);
  });

  it('prefers v2 data over a leftover legacy key', () => {
    localStorage.setItem('schengen/v2/days', JSON.stringify(['2026-10-25']));
    localStorage.setItem(
      'schengen/selectedDates',
      JSON.stringify([{ year: 2026, month: 0, date: 1 }]),
    );
    expect(sorted(createSelectionStore().get())).toEqual([d]);
  });

  it('ignores invalid v2 entries', () => {
    localStorage.setItem(
      'schengen/v2/days',
      JSON.stringify(['2026-10-25', '2026-02-30', 42, null, 'x', '2026-10-25']),
    );
    expect(sorted(createSelectionStore().get())).toEqual([d]);
  });

  it('survives corrupt storage (B10)', () => {
    localStorage.setItem('schengen/v2/days', '{not json');
    expect(createSelectionStore().get().size).toBe(0);
  });

  it('starts empty with nothing stored, without writing', () => {
    expect(createSelectionStore().get().size).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it('persists sorted ISO strings', () => {
    const store = createSelectionStore();
    store.add([d + 2, d, d + 1]);
    expect(stored()).toEqual(['2026-10-25', '2026-10-26', '2026-10-27']);
  });
});

describe('selection store', () => {
  it('toggles, adds, prunes and notifies', () => {
    const store = createSelectionStore();
    let calls = 0;
    store.subscribe(() => calls++);
    store.toggle(d);
    store.add([d - 200, d + 1]);
    store.prune(d - 179);
    expect(sorted(store.get())).toEqual([d, d + 1]);
    store.toggle(d);
    expect([...store.get()]).toEqual([d + 1]);
    expect(calls).toBe(4);
  });

  it('skips no-op updates', () => {
    const store = createSelectionStore();
    store.add([d]);
    let calls = 0;
    store.subscribe(() => calls++);
    const before = store.get();
    store.add([d]);
    store.set(new Set([d]));
    store.prune(d - 10);
    expect(calls).toBe(0);
    expect(store.get()).toBe(before);
    expect(store.getHistory()).toEqual({ canUndo: true, canRedo: false });
  });

  it('stops notifying after unsubscribe', () => {
    const store = createSelectionStore();
    let calls = 0;
    const off = store.subscribe(() => calls++);
    store.toggle(d);
    off();
    store.toggle(d);
    expect(calls).toBe(1);
  });

  it('clears everything as one undoable step', () => {
    const store = createSelectionStore();
    store.add([d, d + 1]);
    store.clear();
    expect(store.get().size).toBe(0);
    expect(stored()).toEqual([]);
    store.undo();
    expect(sorted(store.get())).toEqual([d, d + 1]);
  });
});

describe('undo / redo', () => {
  it('walks back and forth and persists each step', () => {
    const store = createSelectionStore();
    store.toggle(d);
    store.toggle(d + 1);
    store.undo();
    expect(sorted(store.get())).toEqual([d]);
    expect(stored()).toEqual(['2026-10-25']);
    store.undo();
    expect(store.get().size).toBe(0);
    expect(store.getHistory()).toEqual({ canUndo: false, canRedo: true });
    store.redo();
    store.redo();
    expect(sorted(store.get())).toEqual([d, d + 1]);
    expect(store.getHistory()).toEqual({ canUndo: true, canRedo: false });
  });

  it('ignores undo and redo with empty history', () => {
    const store = createSelectionStore();
    let calls = 0;
    store.subscribe(() => calls++);
    store.undo();
    store.redo();
    expect(calls).toBe(0);
  });

  it('drops the redo stack on a new change', () => {
    const store = createSelectionStore();
    store.toggle(d);
    store.undo();
    store.toggle(d + 5);
    expect(store.getHistory().canRedo).toBe(false);
    store.redo();
    expect(sorted(store.get())).toEqual([d + 5]);
  });

  it('keeps a stable history snapshot until flags change', () => {
    const store = createSelectionStore();
    store.toggle(d);
    const snap = store.getHistory();
    store.toggle(d + 1);
    expect(store.getHistory()).toBe(snap);
  });

  it('caps history at 100 steps', () => {
    const store = createSelectionStore();
    for (let i = 0; i < 120; i++) store.toggle(d + i);
    let undos = 0;
    while (store.getHistory().canUndo) {
      store.undo();
      undos++;
    }
    expect(undos).toBe(100);
    expect(store.get().size).toBe(20);
  });

  it('does not record pruning as an undo step', () => {
    const store = createSelectionStore();
    store.add([d - 300, d]);
    store.prune(d - 179);
    store.undo();
    expect(store.get().size).toBe(0);
    expect(store.getHistory().canUndo).toBe(false);
  });
});

describe('cross-tab sync', () => {
  it('reload picks up changes written by another tab', () => {
    const store = createSelectionStore();
    let calls = 0;
    store.subscribe(() => calls++);
    localStorage.setItem('schengen/v2/days', JSON.stringify(['2026-10-25']));
    store.reload();
    expect(sorted(store.get())).toEqual([d]);
    expect(calls).toBe(1);
  });

  it('the shared store reloads on storage events for its key only', () => {
    selectionStore.reload();
    localStorage.setItem('schengen/v2/days', JSON.stringify(['2026-10-25']));
    window.dispatchEvent(new StorageEvent('storage', { key: 'schengen/other' }));
    expect(selectionStore.get().size).toBe(0);
    window.dispatchEvent(new StorageEvent('storage', { key: 'schengen/v2/days' }));
    expect(sorted(selectionStore.get())).toEqual([d]);
    localStorage.clear();
    selectionStore.reload();
  });
});

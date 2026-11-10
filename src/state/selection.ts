import { useSyncExternalStore } from 'react';
import { parseIso, toIso, toOrd, type Ord } from '../engine/dates';
import { readJson, removeKey, storageKey, writeJson } from './storage';

export const SELECTION_KEY = 'v2/days';
export const LEGACY_KEY = 'selectedDates';

type LegacyDate = { year: number; month: number; date: number };

const isLegacyDate = (v: unknown): v is LegacyDate =>
  typeof v === 'object' &&
  v !== null &&
  ['year', 'month', 'date'].every((k) => Number.isInteger((v as Record<string, unknown>)[k]));

export const migrate = (): Set<Ord> => {
  const stored = readJson(SELECTION_KEY);
  if (Array.isArray(stored)) {
    return new Set(stored.flatMap((v) => (typeof v === 'string' ? (parseIso(v) ?? []) : [])));
  }
  const legacy = readJson(LEGACY_KEY);
  const days = new Set<Ord>(
    Array.isArray(legacy)
      ? legacy.filter(isLegacyDate).map((d) => toOrd(d.year, d.month, d.date))
      : [],
  );
  if (legacy !== undefined) {
    persist(days);
    removeKey(LEGACY_KEY);
  }
  return days;
};

const persist = (days: ReadonlySet<Ord>) =>
  writeJson(SELECTION_KEY, [...days].sort((a, b) => a - b).map(toIso));

type Listener = () => void;
export type History = { canUndo: boolean; canRedo: boolean };

const HISTORY_LIMIT = 100;

export const createSelectionStore = () => {
  let current: ReadonlySet<Ord> = migrate();
  let past: ReadonlySet<Ord>[] = [];
  let future: ReadonlySet<Ord>[] = [];
  let history: History = { canUndo: false, canRedo: false };
  const listeners = new Set<Listener>();
  const emit = () => {
    if (history.canUndo !== past.length > 0 || history.canRedo !== future.length > 0)
      history = { canUndo: past.length > 0, canRedo: future.length > 0 };
    listeners.forEach((l) => l());
  };

  const replace = (next: ReadonlySet<Ord>) => {
    current = next;
    persist(next);
    emit();
  };

  const set = (next: ReadonlySet<Ord>) => {
    if (next.size === current.size && [...next].every((d) => current.has(d))) return;
    past = [...past, current].slice(-HISTORY_LIMIT);
    future = [];
    replace(next);
  };

  return {
    get: () => current,
    getHistory: () => history,
    set,
    undo: () => {
      const prev = past.at(-1);
      if (!prev) return;
      past = past.slice(0, -1);
      future = [current, ...future];
      replace(prev);
    },
    redo: () => {
      const next = future[0];
      if (!next) return;
      future = future.slice(1);
      past = [...past, current];
      replace(next);
    },
    toggle: (day: Ord) => {
      const next = new Set(current);
      if (!next.delete(day)) next.add(day);
      set(next);
    },
    add: (days: Iterable<Ord>) => set(new Set([...current, ...days])),
    clear: () => set(new Set()),
    prune: (before: Ord) => {
      if ([...current].some((d) => d < before))
        replace(new Set([...current].filter((d) => d >= before)));
    },
    reload: () => {
      current = migrate();
      emit();
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export type SelectionStore = ReturnType<typeof createSelectionStore>;

export const selectionStore = createSelectionStore();

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === storageKey(SELECTION_KEY)) selectionStore.reload();
  });
}

export const useSelection = (store: SelectionStore = selectionStore) =>
  useSyncExternalStore(store.subscribe, store.get);

export const useHistory = (store: SelectionStore = selectionStore) =>
  useSyncExternalStore(store.subscribe, store.getHistory);

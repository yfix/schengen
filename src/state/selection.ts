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
  const stored = readJson<unknown>(SELECTION_KEY);
  if (Array.isArray(stored)) {
    return new Set(stored.flatMap((v) => (typeof v === 'string' ? (parseIso(v) ?? []) : [])));
  }
  const legacy = readJson<unknown>(LEGACY_KEY);
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

export const createSelectionStore = () => {
  let current: ReadonlySet<Ord> = migrate();
  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((l) => l());

  const set = (next: ReadonlySet<Ord>) => {
    current = next;
    persist(next);
    emit();
  };

  return {
    get: () => current,
    set,
    toggle: (day: Ord) => {
      const next = new Set(current);
      if (!next.delete(day)) next.add(day);
      set(next);
    },
    add: (days: Iterable<Ord>) => set(new Set([...current, ...days])),
    clear: () => set(new Set()),
    prune: (before: Ord) => {
      if ([...current].some((d) => d < before))
        set(new Set([...current].filter((d) => d >= before)));
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

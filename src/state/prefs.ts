import { useSyncExternalStore } from 'react';
import { readJson, storageKey, writeJson } from './storage';

export const PREFS_KEY = 'v1/prefs';

export const LANGS = ['uk', 'en'] as const;
export const THEMES = ['auto', 'light', 'dark'] as const;
export type Lang = (typeof LANGS)[number];
export type Theme = (typeof THEMES)[number];
export type Prefs = { lang: Lang; theme: Theme; weekStart: number | null };

export const DEFAULT_PREFS: Prefs = { lang: 'uk', theme: 'auto', weekStart: null };

const oneOf = <T extends string>(list: readonly T[], v: unknown, fallback: T): T =>
  list.find((x) => x === v) ?? fallback;

export const parsePrefs = (raw: unknown): Prefs => {
  const r = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const week = r.weekStart;
  return {
    lang: oneOf(LANGS, r.lang, DEFAULT_PREFS.lang),
    theme: oneOf(THEMES, r.theme, DEFAULT_PREFS.theme),
    weekStart:
      typeof week === 'number' && Number.isInteger(week) && week >= 0 && week <= 6 ? week : null,
  };
};

export const createPrefsStore = (initial?: Partial<Prefs>, persist = true) => {
  let current: Prefs = { ...parsePrefs(persist ? readJson(PREFS_KEY) : undefined), ...initial };
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  return {
    get: () => current,
    update: (patch: Partial<Prefs>) => {
      const next = { ...current, ...patch };
      if ((Object.keys(next) as (keyof Prefs)[]).every((k) => next[k] === current[k])) return;
      current = next;
      if (persist) writeJson(PREFS_KEY, current);
      emit();
    },
    reload: () => {
      current = parsePrefs(readJson(PREFS_KEY));
      emit();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export type PrefsStore = ReturnType<typeof createPrefsStore>;

export const prefsStore = createPrefsStore();

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === storageKey(PREFS_KEY)) prefsStore.reload();
  });
}

export const usePrefs = (store: PrefsStore = prefsStore) =>
  useSyncExternalStore(store.subscribe, store.get);

export const applyTheme = (theme: Theme, root: HTMLElement = document.documentElement) => {
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;
  root.ownerDocument.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    const media = (m.dataset.media ??= m.getAttribute('media') ?? '');
    m.setAttribute('media', theme === 'auto' ? media : media.includes(theme) ? 'all' : 'not all');
  });
};

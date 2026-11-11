import { describe, expect, it, vi } from 'vitest';
import { applyTheme, createPrefsStore, DEFAULT_PREFS, parsePrefs, PREFS_KEY } from './prefs';
import { readJson, writeJson } from './storage';

describe('prefs', () => {
  it('defaults to Ukrainian, auto theme, no stored week start', () => {
    expect(DEFAULT_PREFS).toEqual({ lang: 'uk', theme: 'auto', weekStart: null });
    expect(parsePrefs(undefined)).toEqual(DEFAULT_PREFS);
    expect(parsePrefs({ lang: 'xx', theme: 'blue', weekStart: 9 })).toEqual(DEFAULT_PREFS);
    expect(parsePrefs({ lang: 'en', theme: 'dark', weekStart: 0 })).toEqual({
      lang: 'en',
      theme: 'dark',
      weekStart: 0,
    });
  });

  it('persists updates and notifies only on change', () => {
    const store = createPrefsStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.update({ lang: 'en' });
    store.update({ lang: 'en' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(readJson(PREFS_KEY)).toEqual({ lang: 'en', theme: 'auto', weekStart: null });
    expect(createPrefsStore().get().lang).toBe('en');
  });

  it('reloads from storage and can skip persistence', () => {
    const store = createPrefsStore({ theme: 'light' }, false);
    store.update({ weekStart: 0 });
    expect(readJson(PREFS_KEY)).toBeUndefined();
    writeJson(PREFS_KEY, { lang: 'en', theme: 'dark' });
    store.reload();
    expect(store.get()).toEqual({ lang: 'en', theme: 'dark', weekStart: null });
  });

  it('sets data-theme on the root, removes it for auto', () => {
    const root = document.createElement('html');
    applyTheme('dark', root);
    expect(root.dataset.theme).toBe('dark');
    applyTheme('auto', root);
    expect(root.dataset.theme).toBeUndefined();
  });

  it('points the browser theme-color at the forced theme', () => {
    document.head.innerHTML =
      '<meta name="theme-color" media="(prefers-color-scheme: light)"><meta name="theme-color" media="(prefers-color-scheme: dark)">';
    const [light, dark] = document.head.querySelectorAll('meta');
    applyTheme('dark');
    expect([light?.getAttribute('media'), dark?.getAttribute('media')]).toEqual(['not all', 'all']);
    applyTheme('auto');
    expect(dark?.getAttribute('media')).toBe('(prefers-color-scheme: dark)');
    document.head.innerHTML = '';
  });
});

import { render } from '@testing-library/react';
import App from '../App';
import type { Ord } from '../engine/dates';
import { parseSettings } from '../settings';
import { createPrefsStore, type PrefsStore } from '../state/prefs';
import { createSelectionStore, type SelectionStore } from '../state/selection';

export const renderApp = (
  store: SelectionStore = createSelectionStore(),
  search = '?week=1',
  prefs: PrefsStore = createPrefsStore({ lang: 'en' }, false),
) => {
  const utils = render(<App store={store} settings={parseSettings(search)} prefs={prefs} />);
  const cell = (ord: Ord) => utils.container.querySelector<HTMLElement>(`[data-ord="${ord}"]`)!;
  return { store, prefs, cell, ...utils };
};

export const sorted = (s: ReadonlySet<Ord>) => [...s].sort((a, b) => a - b);

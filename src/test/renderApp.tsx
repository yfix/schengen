import { render } from '@testing-library/react';
import App from '../App';
import type { Ord } from '../engine/dates';
import { parseSettings } from '../settings';
import { createSelectionStore, type SelectionStore } from '../state/selection';

export const renderApp = (store: SelectionStore = createSelectionStore()) => {
  const utils = render(<App store={store} settings={parseSettings('')} />);
  const cell = (ord: Ord) => utils.container.querySelector<HTMLElement>(`[data-ord="${ord}"]`)!;
  return { store, cell, ...utils };
};

export const sorted = (s: ReadonlySet<Ord>) => [...s].sort((a, b) => a - b);

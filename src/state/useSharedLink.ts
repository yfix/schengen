import { useEffect } from 'react';
import { readShareHash } from '../engine/share';
import type { SelectionStore } from './selection';

export const useSharedLink = (store: SelectionStore, confirmText: (n: number) => string) => {
  useEffect(() => {
    const days = readShareHash(location.hash);
    if (days === null) return;
    history.replaceState(null, '', location.pathname + location.search);
    if (days.length && window.confirm(confirmText(days.length))) store.add(days);
  }, [store, confirmText]);
};

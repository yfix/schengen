import { useEffect } from 'react';
import { readShareHash } from '../engine/share';
import { plural } from '../format';
import type { SelectionStore } from './selection';

export const useSharedLink = (store: SelectionStore) => {
  useEffect(() => {
    const days = readShareHash(location.hash);
    if (days === null) return;
    history.replaceState(null, '', location.pathname + location.search);
    if (days.length && window.confirm(`Add ${plural(days.length, 'day')} from the shared link?`))
      store.add(days);
  }, [store]);
};

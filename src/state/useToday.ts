import { useEffect, useState } from 'react';
import { localToday, type Ord } from '../engine/dates';

const msUntilTomorrow = (now: Date) => {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime() + 1000;
};

export const useToday = (): Ord => {
  const [today, setToday] = useState(localToday);

  useEffect(() => {
    const refresh = () => setToday(localToday());
    const timer = setTimeout(refresh, msUntilTomorrow(new Date()));
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [today]);

  return today;
};

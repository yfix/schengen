import { useCallback, useState, type KeyboardEvent, type RefObject } from 'react';
import { endOfMonth, fromOrd, toOrd, type Ord } from '../engine/dates';

type Options = {
  today: Ord;
  min: Ord;
  max: Ord;
  listRef: RefObject<HTMLDivElement | null>;
  onToggle: (day: Ord) => void;
  onAdd: (days: Ord[]) => void;
};

const shiftMonth = (day: Ord, delta: number) => {
  const { year, month, date } = fromOrd(day);
  const last = fromOrd(endOfMonth(toOrd(year, month + delta, 1))).date;
  return toOrd(year, month + delta, Math.min(date, last));
};

const target = (key: string, day: Ord): Ord | null => {
  const weekday = (fromOrd(day).weekday + 6) % 7;
  switch (key) {
    case 'ArrowLeft':
      return day - 1;
    case 'ArrowRight':
      return day + 1;
    case 'ArrowUp':
      return day - 7;
    case 'ArrowDown':
      return day + 7;
    case 'Home':
      return day - weekday;
    case 'End':
      return day + 6 - weekday;
    case 'PageUp':
      return shiftMonth(day, -1);
    case 'PageDown':
      return shiftMonth(day, 1);
    default:
      return null;
  }
};

export const useGridKeys = ({ today, min, max, listRef, onToggle, onAdd }: Options) => {
  const [focus, setFocus] = useState<Ord | null>(null);
  const current = Math.min(Math.max(focus ?? today, min), max);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!(e.target instanceof HTMLElement) || !e.target.dataset.ord) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onToggle(current);
        return;
      }
      const next = target(e.key, current);
      if (next === null) return;
      e.preventDefault();
      const clamped = Math.min(Math.max(next, min), max);
      if (e.shiftKey) {
        const lo = Math.min(current, clamped);
        const hi = Math.max(current, clamped);
        onAdd(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i));
      }
      setFocus(clamped);
      const el = listRef.current?.querySelector<HTMLElement>(`[data-ord="${String(clamped)}"]`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'nearest' });
    },
    [current, min, max, listRef, onToggle, onAdd],
  );

  const onFocus = useCallback((e: { target: EventTarget }) => {
    if (e.target instanceof HTMLElement && e.target.dataset.ord)
      setFocus(Number(e.target.dataset.ord));
  }, []);

  return { focus: current, onKeyDown, onFocus };
};

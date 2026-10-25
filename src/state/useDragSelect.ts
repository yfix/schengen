import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import type { Ord } from '../engine/dates';

export type DragMode = 'add' | 'remove';
export type DragRange = { lo: Ord; hi: Ord; mode: DragMode };

export const applyRange = (
  selected: ReadonlySet<Ord>,
  { lo, hi, mode }: DragRange,
): ReadonlySet<Ord> => {
  const next = new Set(selected);
  for (let d = lo; d <= hi; d++) {
    if (mode === 'add') next.add(d);
    else next.delete(d);
  }
  return next;
};

type Options = {
  selected: ReadonlySet<Ord>;
  min: Ord;
  max: Ord;
  onCommit: (next: ReadonlySet<Ord>) => void;
  longPressMs?: number;
};

type Drag = { anchor: Ord; current: Ord; mode: DragMode };
type Pending = { anchor: Ord; mode: DragMode; x: number; y: number; timer: number };

const rangeOf = (d: Drag): DragRange => ({
  lo: Math.min(d.anchor, d.current),
  hi: Math.max(d.anchor, d.current),
  mode: d.mode,
});

const MOVE_TOLERANCE = 8;
const EDGE = 48;
const MAX_SCROLL_STEP = 18;

const ordOf = (el: Element | null): Ord | null => {
  const cell = el?.closest<HTMLElement>('[data-ord]');
  const raw = cell?.dataset.ord;
  return raw === undefined ? null : Number(raw);
};

const ordAt = (x: number, y: number, fallback: EventTarget | null) => {
  const hit =
    typeof document.elementFromPoint === 'function' ? document.elementFromPoint(x, y) : null;
  return ordOf(hit) ?? ordOf(fallback instanceof Element ? fallback : null);
};

export const useDragSelect = ({ selected, min, max, onCommit, longPressMs = 300 }: Options) => {
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const pending = useRef<Pending | null>(null);
  const last = useRef<{ ord: Ord; mode: DragMode } | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const clamp = useCallback((ord: Ord) => Math.min(Math.max(ord, min), max), [min, max]);

  const update = (next: Drag | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  const clearPending = () => {
    if (pending.current) window.clearTimeout(pending.current.timer);
    pending.current = null;
  };

  const commit = (range: DragRange, end: Ord) => {
    last.current = { ord: end, mode: range.mode };
    onCommit(applyRange(selected, range));
  };

  const cancel = useCallback(() => {
    clearPending();
    pointer.current = null;
    dragRef.current = null;
    setDrag(null);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || dragRef.current) return;
    const raw = ordOf(e.target as Element);
    if (raw === null || raw < min || raw > max) return;
    const mode: DragMode = selected.has(raw) ? 'remove' : 'add';

    if (e.shiftKey && last.current) {
      const { ord, mode: lastMode } = last.current;
      commit({ lo: Math.min(ord, raw), hi: Math.max(ord, raw), mode: lastMode }, raw);
      return;
    }

    if (e.pointerType === 'touch') {
      clearPending();
      const timer = window.setTimeout(() => {
        pending.current = null;
        navigator.vibrate?.(10);
        update({ anchor: raw, current: raw, mode });
      }, longPressMs);
      pending.current = { anchor: raw, mode, x: e.clientX, y: e.clientY, timer };
      return;
    }

    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointer.current = { x: e.clientX, y: e.clientY };
    update({ anchor: raw, current: raw, mode });
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const p = pending.current;
    if (p) {
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_TOLERANCE) clearPending();
      return;
    }
    const d = dragRef.current;
    if (!d) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    const ord = ordAt(e.clientX, e.clientY, e.target);
    if (ord !== null && clamp(ord) !== d.current) update({ ...d, current: clamp(ord) });
  };

  const onPointerUp = () => {
    const p = pending.current;
    if (p) {
      clearPending();
      commit({ lo: p.anchor, hi: p.anchor, mode: p.mode }, p.anchor);
      return;
    }
    const d = dragRef.current;
    if (!d) return;
    commit(rangeOf(d), d.current);
    cancel();
  };

  useEffect(() => {
    if (!drag) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drag, cancel]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current) e.preventDefault();
    };
    const onContextMenu = (e: Event) => {
      if (dragRef.current || pending.current) e.preventDefault();
    };
    list.addEventListener('touchmove', onTouchMove, { passive: false });
    list.addEventListener('contextmenu', onContextMenu);
    return () => {
      list.removeEventListener('touchmove', onTouchMove);
      list.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  const active = drag !== null;
  useEffect(() => {
    const scroller = listRef.current?.parentElement;
    if (!active || !scroller) return;
    let frame = 0;
    const tick = () => {
      const p = pointer.current;
      const d = dragRef.current;
      if (p && d) {
        const rect = scroller.getBoundingClientRect();
        const speed = (dist: number) => Math.ceil(((EDGE - dist) / EDGE) * MAX_SCROLL_STEP);
        let dy = 0;
        if (p.y < rect.top + EDGE) dy = -speed(p.y - rect.top);
        else if (p.y > rect.bottom - EDGE) dy = speed(rect.bottom - p.y);
        if (dy) {
          scroller.scrollTop += dy;
          const ord = ordAt(p.x, p.y, null);
          if (ord !== null && clamp(ord) !== d.current) update({ ...d, current: clamp(ord) });
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, clamp]);

  useEffect(() => () => clearPending(), []);

  const range = useMemo(() => (drag ? rangeOf(drag) : null), [drag]);
  const preview = useMemo(() => (range ? applyRange(selected, range) : null), [range, selected]);

  return {
    listRef,
    range,
    preview,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: cancel,
    },
  };
};

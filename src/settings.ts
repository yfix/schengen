import type { Rules } from './engine/schengen';

export type Settings = Rules & { windowsAhead: number; weekStart: number | null };

const intParam = (
  params: URLSearchParams,
  name: string,
  fallback: number,
  min: number,
  max: number,
) => {
  const raw = params.get(name);
  const n = raw === null || raw.trim() === '' ? NaN : Number(raw);
  return Number.isInteger(n) ? Math.min(Math.max(n, min), max) : fallback;
};

export const parseSettings = (search: string): Settings => {
  const params = new URLSearchParams(search);
  const window = intParam(params, 'range', 180, 2, 730);
  const max = intParam(params, 'max', Math.floor(window / 2), 1, window - 1);
  const windowsAhead = intParam(params, 'repeat', 4, 1, 10);
  const week = intParam(params, 'week', -1, 0, 6);
  const weekStart = week >= 0 ? week : null;
  return { window, max, windowsAhead, weekStart };
};

export const settings = parseSettings(typeof location === 'undefined' ? '' : location.search);

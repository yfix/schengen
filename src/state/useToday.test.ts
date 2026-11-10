import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toOrd } from '../engine/dates';
import { useToday } from './useToday';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useToday', () => {
  it('rolls over just after local midnight', async () => {
    vi.setSystemTime(new Date(2026, 9, 25, 23, 59, 50));
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe(toOrd(2026, 9, 25));
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(result.current).toBe(toOrd(2026, 9, 25));
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(result.current).toBe(toOrd(2026, 9, 26));
    await act(() => vi.advanceTimersByTimeAsync(86_400_000));
    expect(result.current).toBe(toOrd(2026, 9, 27));
  });

  it('refreshes when the tab becomes visible again', () => {
    vi.setSystemTime(new Date(2026, 9, 25, 12));
    const { result } = renderHook(() => useToday());
    vi.setSystemTime(new Date(2026, 9, 28, 9));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe(toOrd(2026, 9, 28));
  });

  it('cleans up its timer and listener on unmount', () => {
    vi.setSystemTime(new Date(2026, 9, 25, 12));
    const remove = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useToday());
    unmount();
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});

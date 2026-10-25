import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { localToday } from '../engine/dates';
import { renderApp as setup, sorted } from '../test/renderApp';
import { applyRange } from './useDragSelect';
const t = localToday();

describe('applyRange', () => {
  it('adds or removes a whole range', () => {
    const base = new Set([1, 5]);
    expect(sorted(applyRange(base, { lo: 2, hi: 4, mode: 'add' }))).toEqual([1, 2, 3, 4, 5]);
    expect(sorted(applyRange(base, { lo: 0, hi: 3, mode: 'remove' }))).toEqual([5]);
  });
});

describe('drag select', () => {
  it('selects a range by dragging, previewing before release', async () => {
    const { store, cell, container } = setup();
    const user = userEvent.setup();
    await user.pointer([{ keys: '[MouseLeft>]', target: cell(t) }, { target: cell(t + 4) }]);
    expect(container.querySelectorAll('.Day-InRange')).toHaveLength(5);
    expect(store.get().size).toBe(0);
    expect(container.querySelector('.Summary-Number')).toHaveTextContent('1');
    await user.pointer({ keys: '[/MouseLeft]', target: cell(t + 4) });
    expect(sorted(store.get())).toEqual([t, t + 1, t + 2, t + 3, t + 4]);
    expect(container.querySelectorAll('.Day-InRange')).toHaveLength(0);
  });

  it('dragging backwards from a selected day clears the range', async () => {
    const { store, cell } = setup();
    store.add([t + 1, t + 2, t + 3, t + 4]);
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: cell(t + 3) },
      { target: cell(t + 1) },
      { keys: '[/MouseLeft]', target: cell(t + 1) },
    ]);
    expect(sorted(store.get())).toEqual([t + 4]);
  });

  it('a click still toggles one day', async () => {
    const { store, cell } = setup();
    await userEvent.click(cell(t + 2));
    expect(sorted(store.get())).toEqual([t + 2]);
    await userEvent.click(cell(t + 2));
    expect(store.get().size).toBe(0);
  });

  it('Escape cancels a drag', async () => {
    const { store, cell, container } = setup();
    const user = userEvent.setup();
    await user.pointer([{ keys: '[MouseLeft>]', target: cell(t) }, { target: cell(t + 3) }]);
    await user.keyboard('{Escape}');
    expect(container.querySelectorAll('.Day-InRange')).toHaveLength(0);
    await user.pointer({ keys: '[/MouseLeft]', target: cell(t + 3) });
    expect(store.get().size).toBe(0);
  });

  it('shift+click extends from the last clicked day', async () => {
    const { store, cell } = setup();
    const user = userEvent.setup();
    await user.click(cell(t + 1));
    await user.keyboard('{Shift>}');
    await user.click(cell(t + 5));
    await user.keyboard('{/Shift}');
    expect(sorted(store.get())).toEqual([t + 1, t + 2, t + 3, t + 4, t + 5]);
  });

  it('does not select days older than the window', async () => {
    const { store, cell } = setup();
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: cell(t - 170) },
      { target: cell(t - 200) },
      { keys: '[/MouseLeft]', target: cell(t - 200) },
    ]);
    expect(Math.min(...store.get())).toBe(t - 179);
    expect(store.get().size).toBe(10);
  });

  it('touch: a tap toggles, a long-press starts a drag', () => {
    vi.useFakeTimers();
    try {
      const { store, cell } = setup();
      const touch = { pointerType: 'touch', button: 0, pointerId: 2 };
      fireEvent.pointerDown(cell(t), touch);
      fireEvent.pointerUp(cell(t), touch);
      expect(sorted(store.get())).toEqual([t]);

      fireEvent.pointerDown(cell(t + 2), touch);
      act(() => vi.advanceTimersByTime(350));
      fireEvent.pointerMove(cell(t + 4), touch);
      fireEvent.pointerUp(cell(t + 4), touch);
      expect(sorted(store.get())).toEqual([t, t + 2, t + 3, t + 4]);

      fireEvent.pointerDown(cell(t + 10), { ...touch, clientY: 0 });
      fireEvent.pointerMove(cell(t + 10), { ...touch, clientY: 40 });
      act(() => vi.advanceTimersByTime(350));
      fireEvent.pointerUp(cell(t + 10), touch);
      expect(store.get().has(t + 10)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('undo and redo a drag', async () => {
    const { store, cell } = setup();
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: cell(t) },
      { target: cell(t + 2) },
      { keys: '[/MouseLeft]', target: cell(t + 2) },
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(store.get().size).toBe(0);
    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    expect(store.get().size).toBe(3);
  });
});

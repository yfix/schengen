import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { localToday } from './engine/dates';
import { formatDay } from './format';
import { createSelectionStore } from './state/selection';
import { renderApp } from './test/renderApp';

const t = localToday();
const span = (start: number, length: number) => Array.from({ length }, (_, i) => start + i);
const withDays = (days: number[]) => {
  const store = createSelectionStore();
  store.add(days);
  return renderApp(store);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Summary', () => {
  it('offers a full stay from today when nothing is marked', () => {
    renderApp();
    expect(screen.getByText('90 days left today')).toBeInTheDocument();
    expect(
      screen.getByText(`Enter today: stay up to 90 days, until ${formatDay(t + 89)}`),
    ).toBeInTheDocument();
    expect(screen.queryByText(/planned/)).toBeNull();
  });

  it('says how long you can stay when today is marked', () => {
    withDays([t - 1, t]);
    expect(screen.getByText('88 days left today')).toBeInTheDocument();
    expect(screen.getByText(/^Can stay up to 89 days/)).toBeInTheDocument();
  });

  it('shows the earliest entry once the allowance is used up', () => {
    withDays(span(t - 90, 90));
    expect(screen.getByText('0 days left today')).toBeInTheDocument();
    expect(
      screen.getByText(`Earliest entry ${formatDay(t + 90)}, for up to 90 days`),
    ).toBeInTheDocument();
  });

  it('marks today as the last allowed day when the allowance ends today', () => {
    withDays(span(t - 89, 90));
    expect(screen.getByText(`Can stay up to 1 day, until ${formatDay(t)}`)).toBeInTheDocument();
  });

  it('counts planned future days', () => {
    withDays([t, t + 5, t + 6, t + 7]);
    expect(screen.getByText('3 days planned')).toBeInTheDocument();
  });

  it('prunes days older than the window on load', () => {
    const { store } = withDays([t - 400, t - 180, t - 179, t]);
    expect([...store.get()].sort((a, b) => a - b)).toEqual([t - 179, t]);
  });

  it('reports unreadable import lines without changing the selection', async () => {
    const { store } = renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByText('Import trips'));
    const add = screen.getByRole('button', { name: 'Add' });
    expect(add).toBeDisabled();
    await user.type(screen.getByLabelText('Trips, one per line'), 'nope');
    await user.click(add);
    expect(screen.getByText(/Can't read line 1/)).toBeInTheDocument();
    expect(store.get().size).toBe(0);
  });

  it('clears all days only after confirmation', async () => {
    const { store } = withDays([t, t + 1]);
    const user = userEvent.setup();
    const confirm = vi.fn().mockReturnValueOnce(false);
    vi.stubGlobal('confirm', confirm);
    await user.click(screen.getByText('Import trips'));
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(store.get().size).toBe(2);
    confirm.mockReturnValueOnce(true);
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(store.get().size).toBe(0);
  });

  it('enables undo and redo buttons as history changes', async () => {
    renderApp();
    const user = userEvent.setup();
    const undo = screen.getByRole('button', { name: 'Undo' });
    const redo = screen.getByRole('button', { name: 'Redo' });
    expect(undo).toBeDisabled();
    expect(redo).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /today/ }));
    expect(undo).toBeEnabled();
    await user.click(undo);
    expect(redo).toBeEnabled();
    expect(undo).toBeDisabled();
  });
});

describe('keyboard shortcuts', () => {
  it('Ctrl+Y redoes and Cmd+Z undoes', async () => {
    const { store } = renderApp();
    const user = userEvent.setup();
    store.toggle(t);
    await user.keyboard('{Meta>}z{/Meta}');
    expect(store.get().size).toBe(0);
    await user.keyboard('{Control>}y{/Control}');
    expect(store.get().size).toBe(1);
  });

  it('leaves Ctrl+Z to text fields', async () => {
    const { store } = renderApp();
    const user = userEvent.setup();
    store.toggle(t);
    await user.click(screen.getByText('Import trips'));
    await user.click(screen.getByLabelText('Trips, one per line'));
    await user.keyboard('{Control>}z{/Control}');
    expect(store.get().size).toBe(1);
  });
});

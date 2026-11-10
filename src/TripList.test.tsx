import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { localToday, toIso } from './engine/dates';
import { formatDay } from './format';
import { createSelectionStore } from './state/selection';
import { renderApp, sorted } from './test/renderApp';

const t = localToday();
const span = (start: number, length: number) => Array.from({ length }, (_, i) => start + i);
const withDays = (days: number[]) => {
  const store = createSelectionStore();
  store.add(days);
  return renderApp(store);
};

describe('TripList', () => {
  it('is hidden with no trips', () => {
    renderApp();
    expect(screen.queryByText(/^Trips/)).not.toBeInTheDocument();
  });

  it('lists trips with their length', () => {
    withDays([...span(t - 10, 3), t + 5]);
    expect(screen.getByText('Trips (2)')).toBeInTheDocument();
    expect(screen.getByText(`${formatDay(t - 10)} – ${formatDay(t - 8)}`)).toBeInTheDocument();
    expect(screen.getByText('3 days')).toBeInTheDocument();
    expect(screen.getByText(formatDay(t + 5))).toBeInTheDocument();
  });

  it('deletes a trip, undoable', async () => {
    const { store } = withDays([...span(t, 3), t + 10]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: `Delete trip from ${formatDay(t)}` }));
    expect(sorted(store.get())).toEqual([t + 10]);
    store.undo();
    expect(store.get().size).toBe(4);
  });

  it('edits a trip range', async () => {
    const { store } = withDays(span(t, 3));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: `Edit trip from ${formatDay(t)}` }));
    fireEvent.change(screen.getByLabelText('Entry'), { target: { value: toIso(t + 1) } });
    fireEvent.change(screen.getByLabelText('Exit'), { target: { value: toIso(t + 5) } });
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(sorted(store.get())).toEqual(span(t + 1, 5));
    expect(screen.queryByLabelText('Entry')).not.toBeInTheDocument();
  });

  it('blocks invalid ranges and cancels without changes', async () => {
    const { store } = withDays(span(t, 3));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: `Edit trip from ${formatDay(t)}` }));
    fireEvent.change(screen.getByLabelText('Exit'), { target: { value: toIso(t - 1) } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Exit'), { target: { value: toIso(t + 2) } });
    fireEvent.change(screen.getByLabelText('Entry'), { target: { value: toIso(t - 400) } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    fireEvent.submit(screen.getByLabelText('Entry').closest('form')!);
    expect(store.get().size).toBe(3);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(sorted(store.get())).toEqual(span(t, 3));
  });
});

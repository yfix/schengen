import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { localToday } from './engine/dates';
import { parseSettings } from './settings';
import { createSelectionStore } from './state/selection';

const setup = () => {
  const store = createSelectionStore();
  const utils = render(<App store={store} settings={parseSettings('')} />);
  return { store, ...utils };
};

describe('App', () => {
  it('toggles today and updates the summary', async () => {
    const { container, store } = setup();
    expect(screen.getByText(/of 90 days used in the last 180/)).toBeInTheDocument();
    const today = container.querySelector<HTMLElement>('.Day-Today')!;
    await userEvent.click(today);
    expect(store.get().has(localToday())).toBe(true);
    expect(container.querySelector('.Summary-Number')).toHaveTextContent('1');
    await userEvent.click(today);
    expect(container.querySelector('.Summary-Number')).toHaveTextContent('0');
  });

  it('lets an overstay day be deselected (B4)', async () => {
    const store = createSelectionStore();
    const t = localToday();
    store.add(Array.from({ length: 91 }, (_, i) => t + i));
    const { container } = render(<App store={store} settings={parseSettings('')} />);
    const over = container.querySelector<HTMLElement>('.Day-Over')!;
    expect(screen.getByRole('alert')).toHaveTextContent('Overstay on 1 day');
    await userEvent.click(over);
    expect(container.querySelector('.Day-Over')).toBeNull();
  });

  it('imports trips from text', async () => {
    const { store } = setup();
    const t = localToday();
    await userEvent.click(screen.getByText('Import trips'));
    const iso = (d: number) => new Date(d * 86_400_000).toISOString().slice(0, 10);
    await userEvent.type(screen.getByLabelText('Trips, one per line'), `${iso(t)} ${iso(t + 2)}`);
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(store.get().size).toBe(3);
    expect(screen.getByText('Added 3 days')).toBeInTheDocument();
  });
});

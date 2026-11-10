import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { localToday, toIso } from './engine/dates';
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
const entryInput = () => screen.getByLabelText(/Enter on/);
const lengthInput = () => screen.getByLabelText('Trip length in days');

describe('Planner', () => {
  it('shows how long you can stay entering on a date', () => {
    renderApp();
    expect(
      screen.getByText(`Stay up to 90 days, leave by ${formatDay(t + 89)}`),
    ).toBeInTheDocument();
    fireEvent.change(entryInput(), { target: { value: toIso(t + 10) } });
    expect(
      screen.getByText(`Stay up to 90 days, leave by ${formatDay(t + 99)}`),
    ).toBeInTheDocument();
  });

  it('reports no days left and out-of-range dates', () => {
    withDays(span(t - 90, 90));
    expect(screen.getByText('No days left on that date')).toBeInTheDocument();
    fireEvent.change(entryInput(), { target: { value: toIso(t - 1) } });
    expect(screen.getByText(/^Pick a date from/)).toBeInTheDocument();
    fireEvent.change(entryInput(), { target: { value: '' } });
    expect(screen.getByText(/^Pick a date from/)).toBeInTheDocument();
  });

  it('finds the earliest entry for a trip length', () => {
    withDays(span(t - 90, 90));
    fireEvent.change(lengthInput(), { target: { value: '1' } });
    expect(
      screen.getByText(`${formatDay(t + 90)}, leave by ${formatDay(t + 90)}`),
    ).toBeInTheDocument();
    fireEvent.change(lengthInput(), { target: { value: '0' } });
    expect(screen.getByText('Enter 1 to 90 days')).toBeInTheDocument();
    fireEvent.change(lengthInput(), { target: { value: '2.5' } });
    expect(screen.getByText('Enter 1 to 90 days')).toBeInTheDocument();
  });

  it('says when a trip length never fits in the visible range', () => {
    withDays(Array.from({ length: 300 }, (_, i) => t + 3 * i));
    fireEvent.change(lengthInput(), { target: { value: '90' } });
    expect(screen.getByText(/^Not possible before/)).toBeInTheDocument();
  });
});

describe('day tooltip', () => {
  it('shows days used in the window', () => {
    const { cell } = withDays(span(t - 5, 6));
    expect(cell(t).getAttribute('title')).toContain('6 of 90 days used in the window');
    expect(cell(t + 1).getAttribute('title')).toContain('6 of 90 days used in the window');
  });
});

import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fromOrd, localToday, toOrd } from '../engine/dates';
import { renderApp, sorted } from '../test/renderApp';

const t = localToday();

describe('keyboard grid', () => {
  it('makes only today tabbable and moves focus with arrows', async () => {
    const { cell, container } = renderApp();
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    expect(cell(t)).toHaveAttribute('tabindex', '0');
    const user = userEvent.setup();
    cell(t).focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}{ArrowLeft}{ArrowUp}');
    expect(document.activeElement).toBe(cell(t + 1));
    expect(cell(t + 1)).toHaveAttribute('tabindex', '0');
    expect(cell(t)).toHaveAttribute('tabindex', '-1');
  });

  it('marks with Space/Enter and ranges with Shift+arrows', async () => {
    const { store, cell } = renderApp();
    const user = userEvent.setup();
    cell(t).focus();
    await user.keyboard(' ');
    expect(sorted(store.get())).toEqual([t]);
    await user.keyboard('{Enter}');
    expect(store.get().size).toBe(0);
    await user.keyboard('{Shift>}{ArrowRight}{ArrowRight}{/Shift}');
    expect(sorted(store.get())).toEqual([t, t + 1, t + 2]);
  });

  it('jumps by week edge and month', async () => {
    const { cell } = renderApp();
    const user = userEvent.setup();
    cell(t).focus();
    const weekday = (fromOrd(t).weekday + 6) % 7;
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(cell(t - weekday));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(cell(t - weekday + 6));
    const { year, month, date } = fromOrd(t - weekday + 6);
    await user.keyboard('{PageDown}');
    const next = fromOrd(Number((document.activeElement as HTMLElement).dataset.ord));
    expect(next.month).toBe((month + 1) % 12);
    expect(next.date).toBeLessThanOrEqual(date);
    await user.keyboard('{PageUp}');
    const back = fromOrd(Number((document.activeElement as HTMLElement).dataset.ord));
    expect([back.year, back.month]).toEqual([year, month]);
  });

  it('follows a Sunday week start', async () => {
    const { cell, container } = renderApp(undefined, '?week=0');
    const user = userEvent.setup();
    cell(t).focus();
    await user.keyboard('{Home}');
    expect(fromOrd(Number((document.activeElement as HTMLElement).dataset.ord)).weekday).toBe(0);
    const first = container.querySelector('.Calendar-List .Day:not(.Day-Empty)')!;
    const pads = container.querySelectorAll('.Calendar-List .Day-Empty').length;
    expect(pads).toBe(fromOrd(Number(first.getAttribute('data-ord'))).weekday);
  });

  it('clamps PageDown to the end of a shorter month', async () => {
    const { cell } = renderApp();
    const user = userEvent.setup();
    const { year } = fromOrd(t);
    const jan31 = toOrd(year + 1, 0, 31);
    cell(jan31).focus();
    await user.keyboard('{PageDown}');
    expect(document.activeElement).toBe(cell(toOrd(year + 1, 2, 0)));
  });

  it('stops at the first day of the window', async () => {
    const { cell } = renderApp();
    const user = userEvent.setup();
    cell(t - 175).focus();
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(cell(t - 179));
  });

  it('ignores modified keys and keys outside day cells', () => {
    const { store, cell, container } = renderApp();
    cell(t).focus();
    fireEvent.keyDown(cell(t), { key: 'ArrowRight', ctrlKey: true });
    expect(document.activeElement).toBe(cell(t));
    fireEvent.keyDown(cell(t), { key: 'x' });
    expect(document.activeElement).toBe(cell(t));
    fireEvent.keyDown(container.querySelector('.Calendar-List')!, { key: ' ' });
    expect(store.get().size).toBe(0);
  });
});

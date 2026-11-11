import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createPrefsStore } from './state/prefs';
import { createSelectionStore } from './state/selection';
import { renderApp } from './test/renderApp';

const weekdays = (container: HTMLElement) =>
  [...container.querySelectorAll('.Weekday')].map((w) => w.textContent);

describe('Prefs toolbar', () => {
  it('starts in Ukrainian with Monday first by default', () => {
    const { container } = renderApp(createSelectionStore(), '', createPrefsStore({}, false));
    expect(screen.getByText(/з 90 днів використано за останні 180/)).toBeInTheDocument();
    expect(weekdays(container)[0]).toBe('пн');
    expect(document.documentElement.lang).toBe('uk');
  });

  it('switches language on the fly', async () => {
    const prefs = createPrefsStore({}, false);
    renderApp(createSelectionStore(), '', prefs);
    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(prefs.get().lang).toBe('en');
    expect(screen.getByText(/of 90 days used in the last 180/)).toBeInTheDocument();
    expect(document.title).toBe('Schengen Calendar');
    await userEvent.click(screen.getByRole('button', { name: 'Українська' }));
    expect(document.title).toBe('Шенгенський календар');
  });

  it('switches the first weekday', async () => {
    const { container, prefs } = renderApp();
    expect(weekdays(container)[0]).toBe('Mon');
    const group = screen.getByRole('group', { name: 'Week starts on' });
    await userEvent.click(within(group).getByRole('button', { name: 'Sun' }));
    expect(weekdays(container)[0]).toBe('Sun');
    expect(prefs.get().weekStart).toBe(0);
    expect(within(group).getByRole('button', { name: 'Sun' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches the theme between auto, light and dark', async () => {
    renderApp();
    const root = document.documentElement;
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(root.dataset.theme).toBe('dark');
    await userEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(root.dataset.theme).toBe('light');
    await userEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(root.dataset.theme).toBeUndefined();
  });
});

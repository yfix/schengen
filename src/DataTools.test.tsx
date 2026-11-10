import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { localToday, toIso } from './engine/dates';
import { encodeTrips, toExport } from './engine/share';
import { createSelectionStore } from './state/selection';
import { renderApp, sorted } from './test/renderApp';

const t = localToday();
const rules = { window: 180, max: 90 };
const withDays = (days: number[]) => {
  const store = createSelectionStore();
  store.add(days);
  return renderApp(store);
};
const stubClipboard = (writeText: (text: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
const open = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByText('Import / export'));
  return user;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  history.replaceState(null, '', '/');
});

describe('JSON export/import', () => {
  it('downloads the trips as JSON', async () => {
    withDays([t, t + 1]);
    const user = await open();
    const blobs: Blob[] = [];
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: (b: Blob) => (blobs.push(b), 'blob:x'),
        revokeObjectURL: vi.fn(),
      }),
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await user.click(screen.getByRole('button', { name: 'Export JSON' }));
    expect(click).toHaveBeenCalledOnce();
    expect(JSON.parse(await blobs[0]!.text())).toEqual(toExport([t, t + 1], rules));
    expect(screen.getByText('Exported 2 days')).toBeInTheDocument();
  });

  it('disables export and share with nothing marked', async () => {
    renderApp();
    await open();
    expect(screen.getByRole('button', { name: 'Export JSON' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Share link' })).toBeDisabled();
  });

  it('adds days from an exported file', async () => {
    const { store } = renderApp();
    const user = await open();
    const json = JSON.stringify(toExport([t + 3, t + 4], rules));
    await user.upload(screen.getByLabelText('Import JSON'), new File([json], 'trips.json'));
    await waitFor(() => expect(sorted(store.get())).toEqual([t + 3, t + 4]));
    expect(screen.getByText('Added 2 days from trips.json')).toBeInTheDocument();
  });

  it('rejects a foreign file', async () => {
    const { store } = renderApp();
    const user = await open();
    await user.upload(screen.getByLabelText('Import JSON'), new File(['{}'], 'x.json'));
    expect(await screen.findByText("Can't read x.json: not a Schengen export")).toBeInTheDocument();
    expect(store.get().size).toBe(0);
  });
});

describe('share link', () => {
  it('copies a link with the trips in the hash', async () => {
    withDays([t, t + 1]);
    const user = await open();
    const writeText = vi.fn(() => Promise.resolve());
    stubClipboard(writeText);
    await user.click(screen.getByRole('button', { name: 'Share link' }));
    const link = screen.getByLabelText<HTMLInputElement>('Share link').value;
    expect(link).toMatch(new RegExp(`#t=${encodeTrips([t, t + 1])}$`));
    expect(writeText).toHaveBeenCalledWith(link);
    expect(await screen.findByText('Link copied')).toBeInTheDocument();
  });

  it('falls back to showing the link when the clipboard fails', async () => {
    withDays([t]);
    const user = await open();
    stubClipboard(() => Promise.reject(new Error('denied')));
    await user.click(screen.getByRole('button', { name: 'Share link' }));
    expect(await screen.findByText('Copy the link below')).toBeInTheDocument();
  });

  it('offers to add days from a shared link and clears the hash', () => {
    history.replaceState(null, '', `/?x=1#t=${encodeTrips([t, t + 2])}`);
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
    const { store } = renderApp();
    expect(sorted(store.get())).toEqual([t, t + 2]);
    expect(location.hash).toBe('');
    expect(location.search).toBe('?x=1');
  });

  it('ignores a declined or broken shared link', () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    );
    history.replaceState(null, '', `/#t=${toIso(t).replaceAll('-', '')}`);
    const { store, unmount } = renderApp();
    expect(store.get().size).toBe(0);
    unmount();
    history.replaceState(null, '', '/#t=bogus');
    const confirm = vi.fn(() => true);
    vi.stubGlobal('confirm', confirm);
    renderApp();
    expect(confirm).not.toHaveBeenCalled();
    expect(location.hash).toBe('#t=bogus');
  });
});

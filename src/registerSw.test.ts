import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerSw } from './registerSw';

afterEach(() => vi.restoreAllMocks());

describe('registerSw', () => {
  it('registers the worker on load in production', () => {
    const register = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'serviceWorker', { value: { register }, configurable: true });
    registerSw({ PROD: true });
    window.dispatchEvent(new Event('load'));
    expect(register).toHaveBeenCalledWith('./sw.js');
  });

  it('does nothing in dev', () => {
    const add = vi.spyOn(window, 'addEventListener');
    registerSw({ PROD: false });
    expect(add).not.toHaveBeenCalledWith('load', expect.any(Function));
  });
});

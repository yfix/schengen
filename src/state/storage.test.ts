import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJson, removeKey, storageKey, writeJson } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('storage', () => {
  it('namespaces keys', () => {
    expect(storageKey('v2/days')).toBe('schengen/v2/days');
  });

  it('round-trips JSON under the prefixed key', () => {
    writeJson('k', { a: [1, 2] });
    expect(localStorage.getItem('schengen/k')).toBe('{"a":[1,2]}');
    expect(readJson('k')).toEqual({ a: [1, 2] });
    removeKey('k');
    expect(readJson('k')).toBeUndefined();
  });

  it('returns undefined for missing or corrupt values', () => {
    expect(readJson('missing')).toBeUndefined();
    localStorage.setItem('schengen/bad', '{nope');
    expect(readJson('bad')).toBeUndefined();
  });

  it('swallows quota and access errors on write and remove', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(() => writeJson('k', 1)).not.toThrow();
    expect(() => removeKey('k')).not.toThrow();
  });

  it('degrades to no-ops when localStorage access throws', () => {
    vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    expect(readJson('k')).toBeUndefined();
    expect(() => writeJson('k', 1)).not.toThrow();
    expect(() => removeKey('k')).not.toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { I18N } from './i18n';

describe('i18n', () => {
  it('pluralizes English days', () => {
    const { days } = I18N.en;
    expect([0, 1, -1, 2].map(days)).toEqual(['0 days', '1 day', '-1 day', '2 days']);
  });

  it('pluralizes Ukrainian days', () => {
    const { days } = I18N.uk;
    expect([1, 2, 5, 11, 21, 22, 25, 0].map(days)).toEqual([
      '1 день',
      '2 дні',
      '5 днів',
      '11 днів',
      '21 день',
      '22 дні',
      '25 днів',
      '0 днів',
    ]);
  });

  it('has the same keys in every language', () => {
    expect(Object.keys(I18N.uk.t).sort()).toEqual(Object.keys(I18N.en.t).sort());
  });

  it('fills every message in every language', () => {
    for (const { t } of Object.values(I18N)) {
      for (const msg of Object.values(t)) {
        const text = typeof msg === 'function' ? (msg as (...a: unknown[]) => string)(2, 'X') : msg;
        expect(text).not.toMatch(/undefined|NaN|\[object/);
        expect(text.length).toBeGreaterThan(0);
      }
    }
  });
});

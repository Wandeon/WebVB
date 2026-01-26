import { describe, expect, it } from 'vitest';

import { isValidPageSlug } from './slug';

describe('isValidPageSlug', () => {
  it('accepts single and nested slugs with lowercase segments', () => {
    expect(isValidPageSlug('organizacija')).toBe(true);
    expect(isValidPageSlug('rad-uprave')).toBe(true);
    expect(isValidPageSlug('organizacija/uprava')).toBe(true);
    expect(isValidPageSlug('opcina/komunalne-naknade')).toBe(true);
  });

  it('rejects empty or malformed slugs', () => {
    expect(isValidPageSlug('')).toBe(false);
    expect(isValidPageSlug('/organizacija')).toBe(false);
    expect(isValidPageSlug('organizacija/')).toBe(false);
    expect(isValidPageSlug('organizacija//uprava')).toBe(false);
  });

  it('rejects uppercase, spaces, and special characters', () => {
    expect(isValidPageSlug('Organizacija')).toBe(false);
    expect(isValidPageSlug('rad uprave')).toBe(false);
    expect(isValidPageSlug('rad_uprave')).toBe(false);
    expect(isValidPageSlug('rad/uprave?test')).toBe(false);
  });
});

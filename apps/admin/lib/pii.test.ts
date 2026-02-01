import { describe, expect, it } from 'vitest';

import { anonymizeIp, getEmailLogFields, getTextLogFields, hashValue } from './pii';

describe('pii helpers', () => {
  it('hashValue returns a stable short hash', () => {
    expect(hashValue('test@example.com')).toBe('973dfe463ec8');
  });

  it('getEmailLogFields returns hash and domain', () => {
    expect(getEmailLogFields('Test@Example.com')).toEqual({
      emailHash: '973dfe463ec8',
      emailDomain: 'example.com',
    });
  });

  it('getTextLogFields returns hash and length', () => {
    expect(getTextLogFields('Osjetljivi tekst')).toEqual({
      textHash: '93375ce119b6',
      textLength: 16,
    });
  });

  it('anonymizeIp masks IPv4 addresses', () => {
    expect(anonymizeIp('192.168.1.22')).toBe('192.168.1.0');
  });

  it('anonymizeIp masks IPv6 addresses', () => {
    expect(anonymizeIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe('2001:0db8:85a3:0000::');
  });
});

import { describe, expect, it } from 'vitest';

import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('converts title to lowercase slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('handles Croatian diacritics', () => {
    expect(generateSlug('Čekić i ščepanje')).toBe('cekic-i-scepanje');
    expect(generateSlug('Đurđevdan')).toBe('durdevdan');
    expect(generateSlug('Žuto cvijeće')).toBe('zuto-cvijece');
    expect(generateSlug('Šuma šumi')).toBe('suma-sumi');
  });

  it('removes special characters', () => {
    expect(generateSlug('Hello! World?')).toBe('hello-world');
    expect(generateSlug('Test: A & B')).toBe('test-a-b');
  });

  it('collapses multiple spaces into single hyphen', () => {
    expect(generateSlug('Hello    World')).toBe('hello-world');
  });

  it('collapses multiple hyphens into single hyphen', () => {
    expect(generateSlug('Hello---World')).toBe('hello-world');
  });

  it('removes leading and trailing hyphens', () => {
    expect(generateSlug('-Hello World-')).toBe('hello-world');
    expect(generateSlug('---Test---')).toBe('test');
  });

  it('handles numbers', () => {
    expect(generateSlug('Test 123')).toBe('test-123');
    expect(generateSlug('2024 Nova godina')).toBe('2024-nova-godina');
  });

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('handles string with only special characters', () => {
    expect(generateSlug('!@#$%^&*()')).toBe('');
  });

  it('handles real Croatian municipality titles', () => {
    expect(generateSlug('Općinske aktualnosti iz Velikog Bukovca')).toBe(
      'opcinske-aktualnosti-iz-velikog-bukovca'
    );
    expect(generateSlug('Natječaj za radno mjesto')).toBe(
      'natjecaj-za-radno-mjesto'
    );
    expect(generateSlug('Blagdanski program za Božić 2024')).toBe(
      'blagdanski-program-za-bozic-2024'
    );
  });
});

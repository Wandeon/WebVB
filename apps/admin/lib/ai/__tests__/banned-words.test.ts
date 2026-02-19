import { describe, expect, it } from 'vitest';

import {
  findAllBanned,
  findBannedPhrases,
  findBannedWords,
} from '../prompts/banned-words';

// =============================================================================
// findBannedWords tests (#161 -- Croatian word boundaries)
// =============================================================================

describe('findBannedWords', () => {
  it('finds Croatian banned words', () => {
    const text = 'Ovo je revolucionarno rješenje za transformativno poboljšanje.';
    const found = findBannedWords(text);

    expect(found).toContain('revolucionarno');
    expect(found).toContain('transformativno');
  });

  it('finds English buzzwords', () => {
    const text = 'This is a game-changing, cutting-edge solution.';
    const found = findBannedWords(text);

    expect(found).toContain('game-changing');
    expect(found).toContain('cutting-edge');
  });

  it('returns empty array when no banned words', () => {
    const text = 'Općina Veliki Bukovec organizira radnu akciju čišćenja.';
    const found = findBannedWords(text);

    expect(found).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const text = 'REVOLUCIONARNO rješenje';
    const found = findBannedWords(text);

    expect(found).toContain('revolucionarno');
  });

  it('matches whole words only', () => {
    const text = 'This system is robust and works robustly with robustness.';
    const found = findBannedWords(text);

    // Should find 'robust' but not match 'robustly' or 'robustness' as separate entries
    expect(found).toContain('robust');
    expect(found).toHaveLength(1);
  });

  // #161: Croatian diacritics word boundary tests
  it('does not false-match when preceded by Croatian diacritic characters', () => {
    // A Croatian letter before the banned word should prevent matching
    const text = 'Ovo je čputovanje test.';
    const found = findBannedWords(text);

    expect(found).not.toContain('putovanje');
  });

  it('does not false-match when followed by Croatian diacritic characters', () => {
    // A Croatian letter after the banned word should prevent matching
    const text = 'Ovo je putovanješ test.';
    const found = findBannedWords(text);

    expect(found).not.toContain('putovanje');
  });

  it('matches banned word at start of text', () => {
    const text = 'Revolucionarno rješenje za sve.';
    const found = findBannedWords(text);

    expect(found).toContain('revolucionarno');
  });

  it('matches banned word at end of text', () => {
    const text = 'Ovo je revolucionarno';
    const found = findBannedWords(text);

    expect(found).toContain('revolucionarno');
  });

  it('matches banned word followed by punctuation', () => {
    const text = 'Ovo je revolucionarno, zar ne?';
    const found = findBannedWords(text);

    expect(found).toContain('revolucionarno');
  });

  it('correctly handles word with proper boundaries next to Croatian text', () => {
    const text = 'Ovo putovanje je bilo lijepo.';
    const found = findBannedWords(text);

    expect(found).toContain('putovanje');
  });
});

// =============================================================================
// findBannedPhrases tests
// =============================================================================

describe('findBannedPhrases', () => {
  it('finds banned phrases', () => {
    const text = 'U današnjem svijetu, važno je napomenuti da...';
    const found = findBannedPhrases(text);

    expect(found).toContain('u današnjem svijetu');
    expect(found).toContain('važno je napomenuti');
  });

  it('returns empty array when no banned phrases', () => {
    const text = 'Općina objavljuje natječaj za stipendije.';
    const found = findBannedPhrases(text);

    expect(found).toHaveLength(0);
  });

  it('does not flag normal Croatian connectors', () => {
    const text = 'Naravno, zapravo je osim toga štoviše nadalje u konačnici sve u svemu.';
    const found = findBannedPhrases(text);

    expect(found).toHaveLength(0);
  });
});

// =============================================================================
// findAllBanned tests
// =============================================================================

describe('findAllBanned', () => {
  it('returns both words and phrases', () => {
    const text = 'U današnjem svijetu, ovo revolucionarno rješenje...';
    const result = findAllBanned(text);

    expect(result.words).toContain('revolucionarno');
    expect(result.phrases).toContain('u današnjem svijetu');
  });

  it('returns empty arrays when text is clean', () => {
    const text = 'Općina Veliki Bukovec organizira akciju čišćenja okoliša.';
    const result = findAllBanned(text);

    expect(result.words).toHaveLength(0);
    expect(result.phrases).toHaveLength(0);
  });
});

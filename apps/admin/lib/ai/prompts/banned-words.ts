/**
 * Croatian Banned Words List
 * Articles containing these words/phrases will be flagged for rewrite
 *
 * Categories:
 * - AI buzzwords (Croatian translations)
 * - Filler phrases that add no value
 * - Overly formal/bureaucratic language
 * - English buzzwords that shouldn't appear
 */

// =============================================================================
// Banned Words (Single Words)
// =============================================================================

export const BANNED_WORDS = [
  // AI buzzwords (Croatian)
  'revolucionarno',
  'revolucionaran',
  'transformativno',
  'transformativan',
  'inovativan',
  'inovativno',
  'krajobraz',           // "landscape" used metaphorically
  'putovanje',           // "journey" used metaphorically
  'sinergija',
  'optimizirati',
  'leverirati',          // anglicism
  'implementirati',      // prefer "provesti" or "uvesti"

  // English buzzwords (should not appear in Croatian text)
  'game-changing',
  'cutting-edge',
  'state-of-the-art',
  'unprecedented',
  'groundbreaking',
  'revolutionary',
  'transformative',
  'innovative',
  'leverage',
  'synergy',
  'paradigm',
  'holistic',
  'robust',
  'seamless',
  'streamline',
] as const;

// =============================================================================
// Banned Phrases
// =============================================================================

export const BANNED_PHRASES = [
  // AI filler phrases (Croatian)
  'u današnjem svijetu',
  'u svijetu koji se stalno mijenja',
  'nije tajna da',
  'važno je napomenuti',
  'vrijedi spomenuti',
  'kao što svi znamo',
  'bez sumnje',
  'jednostavno rečeno',

  // Overly formal openings
  'ovim putem',
  's poštovanjem',
  'sa zadovoljstvom',

  // AI-style empty transitions
  'u tom kontekstu',
  'u tom smislu',
  's tim u vezi',

  // Vague hype statements
  'iznimno važno',
  'od velike važnosti',
  'bitno je naglasiti',
  'posebno treba istaknuti',
] as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create a Unicode-aware word boundary regex for Croatian text (#161).
 * JS `\b` does not treat čćšžđ as word characters, causing false matches.
 */
function createWordBoundaryRegex(word: string): RegExp {
  const boundary = String.raw`(?<![a-zA-ZčćšžđČĆŠŽĐáéíóúàèìòùäëïöüâêîôû0-9])`;
  const boundaryEnd = String.raw`(?![a-zA-ZčćšžđČĆŠŽĐáéíóúàèìòùäëïöüâêîôû0-9])`;
  return new RegExp(`${boundary}${escapeRegex(word)}${boundaryEnd}`, 'gi');
}

/**
 * Find banned words in text
 * Returns array of banned words found
 */
export function findBannedWords(text: string): string[] {
  const found: string[] = [];

  for (const word of BANNED_WORDS) {
    const regex = createWordBoundaryRegex(word);
    if (regex.test(text)) {
      found.push(word);
    }
  }

  return found;
}

/**
 * Check if text contains any banned phrases
 * Returns array of found banned phrases
 */
export function findBannedPhrases(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }

  return found;
}

/**
 * Check all banned content and return combined results
 */
export function findAllBanned(text: string): { words: string[]; phrases: string[] } {
  return {
    words: findBannedWords(text),
    phrases: findBannedPhrases(text),
  };
}

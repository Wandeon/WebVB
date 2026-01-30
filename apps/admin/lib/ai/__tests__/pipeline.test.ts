import { describe, expect, it } from 'vitest';

import {
  findAllBanned,
  findBannedPhrases,
  findBannedWords,
} from '../prompts/banned-words';
import { parseReviewResponse } from '../prompts/review';
import { PIPELINE_CONFIG } from '../prompts/types';

describe('banned-words', () => {
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
  });

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
  });

  describe('findAllBanned', () => {
    it('returns both words and phrases', () => {
      const text = 'U današnjem svijetu, ovo revolucionarno rješenje...';
      const result = findAllBanned(text);

      expect(result.words).toContain('revolucionarno');
      expect(result.phrases).toContain('u današnjem svijetu');
    });
  });
});

describe('review parser', () => {
  it('parses valid review response', () => {
    const response = `
    {
      "scores": {
        "clarity": 8,
        "localRelevance": 7,
        "slopScore": 9,
        "flow": 8
      },
      "overall": 8,
      "pass": true,
      "issues": []
    }
    `;

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.scores.clarity).toBe(8);
    expect(result?.pass).toBe(true);
    expect(result?.issues).toHaveLength(0);
  });

  it('parses review with issues', () => {
    const response = `
    {
      "scores": {
        "clarity": 6,
        "localRelevance": 5,
        "slopScore": 4,
        "flow": 6
      },
      "overall": 5.25,
      "pass": false,
      "issues": [
        {
          "type": "slop_word",
          "location": "odlomak 1",
          "text": "revolucionarno",
          "fix": "Zamijeni s konkretnim opisom"
        }
      ]
    }
    `;

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.pass).toBe(false);
    expect(result?.issues).toHaveLength(1);
    expect(result?.issues?.[0]?.type).toBe('slop_word');
  });

  it('extracts JSON from text with extra content', () => {
    const response = `
    Evo moje analize:

    {
      "scores": { "clarity": 8, "localRelevance": 7, "slopScore": 9, "flow": 8 },
      "overall": 8,
      "pass": true,
      "issues": []
    }

    Nadam se da je ovo korisno!
    `;

    const result = parseReviewResponse(response);

    expect(result).not.toBeNull();
    expect(result?.pass).toBe(true);
  });

  it('returns null for invalid JSON', () => {
    const response = 'This is not JSON at all';

    const result = parseReviewResponse(response);

    expect(result).toBeNull();
  });

  it('returns null for missing required fields', () => {
    const response = '{ "scores": { "clarity": 8 } }';

    const result = parseReviewResponse(response);

    expect(result).toBeNull();
  });
});

describe('pipeline config', () => {
  it('has correct default values', () => {
    expect(PIPELINE_CONFIG.qualityThreshold).toBe(7.0);
    expect(PIPELINE_CONFIG.maxRewriteAttempts).toBe(2);
    expect(PIPELINE_CONFIG.maxSentenceWords).toBe(30);
  });
});

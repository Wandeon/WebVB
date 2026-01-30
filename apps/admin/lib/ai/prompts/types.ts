/**
 * Types for AI self-review pipeline
 * Based on 6-stage article generation pipeline
 */

// =============================================================================
// Review Types
// =============================================================================

export interface ReviewScores {
  clarity: number;        // 1-10: Is it clear what the article is about?
  localRelevance: number; // 1-10: Connected to Veliki Bukovec/local readers?
  slopScore: number;      // 1-10: Free from AI-speak? (10 = no slop)
  flow: number;           // 1-10: Reads naturally, good structure?
}

export interface ReviewIssue {
  type:
    | 'slop_word'          // Banned word detected
    | 'slop_phrase'        // AI-sounding phrase
    | 'sentence_too_long'  // >30 words
    | 'wall_of_text'       // >5 sentences in paragraph
    | 'missing_local'      // No connection to local context
    | 'missing_concrete'   // Vague without specifics
    | 'grammar';           // Grammar/spelling issue
  location: string;        // e.g., "paragraph 2" or "title"
  text?: string;           // The problematic text
  fix: string;             // Specific instruction how to fix
}

export interface ReviewResult {
  scores: ReviewScores;
  overall: number;         // Average of scores
  pass: boolean;           // true if overall >= 7.0
  issues: ReviewIssue[];   // Specific problems to fix
}

// =============================================================================
// Pipeline Configuration
// =============================================================================

export const PIPELINE_CONFIG = {
  qualityThreshold: 7.0,   // Minimum overall score to pass
  maxRewriteAttempts: 2,   // Max rewrite loops before proceeding
  maxSentenceWords: 30,    // Sentences longer than this get flagged
  maxParagraphSentences: 5, // Paragraphs with more sentences get flagged
} as const;

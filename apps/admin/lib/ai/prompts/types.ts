/**
 * Types for AI self-review pipeline
 * Issue-only review: pass/fail determined by presence of concrete violations
 */

// =============================================================================
// Review Types
// =============================================================================

export interface ReviewIssue {
  type:
    | 'slop_word'          // Banned word detected
    | 'slop_phrase'        // AI-sounding phrase
    | 'sentence_too_long'  // >25 words
    | 'wall_of_text'       // >4 sentences in paragraph
    | 'missing_local'      // No connection to local context
    | 'missing_concrete'   // Vague without specifics
    | 'invented_fact'      // Fact not in source material
    | 'grammar';           // Grammar/spelling issue
  location: string;        // e.g., "paragraph 2" or "title"
  text?: string;           // The problematic text
  fix: string;             // Specific instruction how to fix
}

export interface ReviewResult {
  pass: boolean;           // true if no issues found
  issues: ReviewIssue[];   // Specific problems to fix
}

// =============================================================================
// Pipeline Configuration
// =============================================================================

export const PIPELINE_CONFIG = {
  maxRewriteAttempts: 2,   // Max rewrite loops before proceeding
  maxSentenceWords: 25,    // Sentences longer than this get flagged
  maxParagraphSentences: 4, // Paragraphs with more sentences get flagged
} as const;

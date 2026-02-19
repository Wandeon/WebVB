/**
 * Review Stage Prompt
 * Issue-only review: identifies concrete violations, no numeric scores
 */

import { extractJson } from '../prompt-utils';
import { BANNED_PHRASES, BANNED_WORDS } from './banned-words';
import { PIPELINE_CONFIG, type ReviewIssue, type ReviewResult } from './types';

// =============================================================================
// System Prompt
// =============================================================================

export const REVIEW_SYSTEM_PROMPT = `Ti si kontrolor kvalitete za članke Općine Veliki Bukovec.
Tvoj zadatak je pronaći KONKRETNE PROBLEME u članku. Ne ocjenjuj, ne daj mišljenje — samo navedi greške.

ŠTO TRAŽIŠ:
- slop_word: Zabranjena riječ (${BANNED_WORDS.slice(0, 10).join(', ')})
- slop_phrase: Zabranjena fraza (${BANNED_PHRASES.slice(0, 8).join('; ')})
- sentence_too_long: Rečenica ima više od ${PIPELINE_CONFIG.maxSentenceWords} riječi
- wall_of_text: Odlomak ima više od ${PIPELINE_CONFIG.maxParagraphSentences} rečenice
- missing_concrete: Previše neodređeno, nedostaju konkretni podaci (tko, što, kada, gdje)
- invented_fact: Članak tvrdi nešto što nije u izvornom materijalu
- grammar: Gramatička ili pravopisna greška

PRAVILA:
1. Svaki problem MORA imati konkretnu uputu za popravak
2. LOŠE: "Poboljšaj tečnost" — DOBRO: "Podijeli rečenicu u odlomku 3 nakon 'međutim' — ima 32 riječi"
3. Ako nema problema, vrati prazan issues array
4. NE izmišljaj probleme — ako je članak u redu, reci da je u redu

Odgovori ISKLJUČIVO u JSON formatu.`;

// =============================================================================
// User Prompt Builder
// =============================================================================

export function buildReviewUserPrompt(article: {
  title: string;
  content: string;
  excerpt: string;
}): string {
  return `Pregledaj ovaj članak za web stranicu Općine Veliki Bukovec.
Navedi SAMO konkretne probleme. Ako nema problema, issues neka bude prazan array.

NASLOV:
${article.title}

SAŽETAK:
${article.excerpt}

SADRŽAJ:
${article.content}

---

Odgovori u JSON formatu:
{
  "pass": <true ako nema problema, false ako ima>,
  "issues": [
    {
      "type": "<tip problema>",
      "location": "<gdje se nalazi, npr. 'odlomak 2' ili 'naslov'>",
      "text": "<problematični tekst>",
      "fix": "<KONKRETNA uputa za popravak>"
    }
  ]
}`;
}

// =============================================================================
// Response Parser
// =============================================================================

// Valid issue type values for structural validation (#147)
const VALID_ISSUE_TYPES = new Set<string>([
  'slop_word', 'slop_phrase', 'sentence_too_long', 'wall_of_text',
  'missing_concrete', 'missing_local', 'invented_fact', 'grammar',
]);

/** Type guard for a single ReviewIssue from LLM output (#147) */
function isValidIssue(issue: unknown): issue is ReviewIssue {
  if (!issue || typeof issue !== 'object') return false;
  const obj = issue as Record<string, unknown>;
  return (
    typeof obj.type === 'string' && VALID_ISSUE_TYPES.has(obj.type) &&
    typeof obj.location === 'string' &&
    typeof obj.fix === 'string'
  );
}

/** Max issues to accept from a single LLM review response */
const MAX_REVIEW_ISSUES = 20;

export function parseReviewResponse(response: string): ReviewResult | null {
  const parsed = extractJson(response);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('pass' in parsed) ||
    !('issues' in parsed)
  ) {
    return null;
  }

  const result = parsed as { pass: unknown; issues: unknown };

  if (typeof result.pass !== 'boolean' || !Array.isArray(result.issues)) {
    return null;
  }

  // Validate each issue individually and cap at MAX_REVIEW_ISSUES (#147)
  const validIssues = (result.issues as unknown[])
    .filter(isValidIssue)
    .slice(0, MAX_REVIEW_ISSUES);

  return {
    pass: result.pass,
    issues: validIssues,
  };
}

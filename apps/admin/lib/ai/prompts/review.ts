/**
 * Review Stage Prompt
 * Scores article quality and identifies specific issues to fix
 */

import { BANNED_PHRASES, BANNED_WORDS } from './banned-words';
import { PIPELINE_CONFIG, type ReviewResult } from './types';

// =============================================================================
// System Prompt
// =============================================================================

export const REVIEW_SYSTEM_PROMPT = `Ti si kontrolor kvalitete za članke Općine Veliki Bukovec.
Tvoj zadatak je ocijeniti kvalitetu članka i identificirati konkretne probleme.

PRAVILA OCJENJIVANJA (1-10):
- clarity (jasnoća): Je li jasno o čemu članak govori? 10 = kristalno jasno
- localRelevance (lokalna relevantnost): Je li povezano s Velikim Bukovcem? 10 = izravno relevantno
- slopScore (AI-govor): Je li tekst prirodan? 10 = zvuči potpuno ljudski, 1 = očito AI
- flow (tečnost): Čita li se glatko? 10 = izvrsna struktura i prijelazi

ZABRANJENE RIJEČI (članak PADA ako ih sadrži):
${BANNED_WORDS.slice(0, 15).join(', ')}

ZABRANJENE FRAZE (članak PADA ako ih sadrži):
${BANNED_PHRASES.slice(0, 10).join('; ')}

TIPOVI PROBLEMA:
- slop_word: Pronađena zabranjena riječ
- slop_phrase: Pronađena AI-tipična fraza
- sentence_too_long: Rečenica ima više od ${PIPELINE_CONFIG.maxSentenceWords} riječi
- wall_of_text: Odlomak ima više od ${PIPELINE_CONFIG.maxParagraphSentences} rečenica
- missing_local: Nedostaje poveznica s lokalnom zajednicom
- missing_concrete: Previše neodređeno, nedostaju konkretni podaci
- grammar: Gramatička ili pravopisna greška

VAŽNO: Svaki problem MORA imati konkretnu uputu za popravak!
- LOŠE: "Poboljšaj tečnost"
- DOBRO: "Podijeli rečenicu u odlomku 3 nakon 'međutim' - trenutno ima 35 riječi"

Odgovori ISKLJUČIVO u JSON formatu.`;

// =============================================================================
// User Prompt Builder
// =============================================================================

export function buildReviewUserPrompt(article: {
  title: string;
  content: string;
  excerpt: string;
}): string {
  return `Ocijeni ovaj članak za web stranicu Općine Veliki Bukovec:

NASLOV:
${article.title}

SAŽETAK:
${article.excerpt}

SADRŽAJ:
${article.content}

---

Odgovori u JSON formatu:
{
  "scores": {
    "clarity": <1-10>,
    "localRelevance": <1-10>,
    "slopScore": <1-10>,
    "flow": <1-10>
  },
  "overall": <prosjek ocjena>,
  "pass": <true ako overall >= ${PIPELINE_CONFIG.qualityThreshold}>,
  "issues": [
    {
      "type": "<tip problema>",
      "location": "<gdje se nalazi, npr. 'odlomak 2' ili 'naslov'>",
      "text": "<problematični tekst ako je primjenjivo>",
      "fix": "<KONKRETNA uputa za popravak>"
    }
  ]
}

Ako nema problema, issues neka bude prazan array [].`;
}

// =============================================================================
// Response Parser
// =============================================================================

export function parseReviewResponse(response: string): ReviewResult | null {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as unknown;

    // Validate structure
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('scores' in parsed) ||
      !('overall' in parsed) ||
      !('pass' in parsed) ||
      !('issues' in parsed)
    ) {
      return null;
    }

    const result = parsed as ReviewResult;

    // Validate scores exist
    if (
      typeof result.scores.clarity !== 'number' ||
      typeof result.scores.localRelevance !== 'number' ||
      typeof result.scores.slopScore !== 'number' ||
      typeof result.scores.flow !== 'number'
    ) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

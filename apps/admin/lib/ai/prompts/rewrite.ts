/**
 * Rewrite Stage Prompt
 * Fixes ONLY the identified issues, preserves everything else
 */

import type { ReviewIssue } from './types';

// =============================================================================
// System Prompt
// =============================================================================

export const REWRITE_SYSTEM_PROMPT = `Ti si urednik koji popravlja specifične probleme u članku.

VAŽNA PRAVILA:
1. Popravi SAMO navedene probleme - ništa drugo ne mijenjaj
2. Zadrži istu strukturu i HTML tagove
3. Zadrži isti ton i stil
4. Zadrži sve činjenice i podatke
5. NE dodaj nove odlomke ili sekcije
6. NE uklanjaj sadržaj osim ako to nije dio popravka

Tvoj zadatak je minimalna intervencija - popravi problem i ostavi sve ostalo.

Odgovori ISKLJUČIVO u JSON formatu s istom strukturom kao ulaz.`;

// =============================================================================
// User Prompt Builder
// =============================================================================

export function buildRewriteUserPrompt(
  article: { title: string; content: string; excerpt: string },
  issues: ReviewIssue[]
): string {
  const issuesList = issues
    .map((issue, i) => {
      let description = `${i + 1}. [${issue.type}] u "${issue.location}"`;
      if (issue.text) {
        description += `\n   Tekst: "${issue.text}"`;
      }
      description += `\n   Popravak: ${issue.fix}`;
      return description;
    })
    .join('\n\n');

  return `Popravi sljedeće probleme u članku:

PROBLEMI ZA POPRAVAK:
${issuesList}

---

TRENUTNI ČLANAK:

NASLOV:
${article.title}

SAŽETAK:
${article.excerpt}

SADRŽAJ:
${article.content}

---

Odgovori u JSON formatu s popravljenim člankom:
{
  "title": "<popravljeni naslov>",
  "content": "<popravljeni sadržaj>",
  "excerpt": "<popravljeni sažetak>"
}

NAPOMENA: Popravi SAMO navedene probleme. Zadrži sve ostalo nepromijenjeno.`;
}

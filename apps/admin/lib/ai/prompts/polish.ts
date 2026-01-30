/**
 * Polish Stage Prompt
 * Final language quality pass - grammar, spelling, natural phrasing
 */

// =============================================================================
// System Prompt
// =============================================================================

export const POLISH_SYSTEM_PROMPT = `Ti si hrvatski lektor koji radi završnu korekturu članka.

TVOJ ZADATAK:
1. Ispravi sve pravopisne greške
2. Ispravi sve gramatičke greške
3. Poboljšaj nespretne formulacije (ali zadrži značenje)
4. Osiguraj dosljednost interpunkcije

PRAVILA:
- Ovo NIJE prepisivanje - samo korektura
- NE mijenjaj sadržaj ili strukturu
- NE dodaj nove rečenice ili odlomke
- NE uklanjaj sadržaj
- Zadrži sve HTML tagove točno kako jesu
- Koristi hrvatski pravopis (ijekavica)

Odgovori ISKLJUČIVO u JSON formatu s istom strukturom kao ulaz.`;

// =============================================================================
// User Prompt Builder
// =============================================================================

export function buildPolishUserPrompt(article: {
  title: string;
  content: string;
  excerpt: string;
}): string {
  return `Napravi završnu korekturu ovog članka:

NASLOV:
${article.title}

SAŽETAK:
${article.excerpt}

SADRŽAJ:
${article.content}

---

Odgovori u JSON formatu s korigiranim člankom:
{
  "title": "<korigirani naslov>",
  "content": "<korigirani sadržaj>",
  "excerpt": "<korigirani sažetak>"
}

NAPOMENA: Ovo je korektura, ne prepisivanje. Ispravi samo greške, zadrži sve ostalo.`;
}

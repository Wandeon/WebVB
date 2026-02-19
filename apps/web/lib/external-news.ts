// Build-time fetcher for community news from local institutions
// Sources: parish (WordPress RSS), school (WordPress RSS), kindergarten (Joomla HTML)

export interface NewsSource {
  name: string;
  shortName: string;
  color: string;
  url: string;
}

export interface ExternalNewsItem {
  title: string;
  url: string;
  date: Date;
  excerpt: string;
  source: NewsSource;
}

export const PARISH_SOURCE: NewsSource = {
  name: 'Župa sv. Franje Asiškoga',
  shortName: 'Župa',
  color: 'bg-purple-100 text-purple-700',
  url: 'https://zupa-sv-franje-asiskog.hr',
};

export const SCHOOL_SOURCE: NewsSource = {
  name: 'OŠ Veliki Bukovec',
  shortName: 'Škola',
  color: 'bg-emerald-100 text-emerald-700',
  url: 'http://www.os-veliki-bukovec.skole.hr',
};

export const KINDERGARTEN_SOURCE: NewsSource = {
  name: 'DV Krijesnica',
  shortName: 'Vrtić',
  color: 'bg-amber-100 text-amber-700',
  url: 'https://www.vrtic-krijesnica.hr',
};

export const OPCINA_SOURCE: NewsSource = {
  name: 'Općina Veliki Bukovec',
  shortName: 'Općina',
  color: 'bg-primary-100 text-primary-700',
  url: '',
};

function cleanHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = content.match(regex);
  return match?.[1]?.trim() || '';
}

function parseRss(xml: string, source: NewsSource): ExternalNewsItem[] {
  const items: ExternalNewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1]!;
    const title = cleanHtml(extractTag(content, 'title'));

    // WordPress RSS sometimes puts <link> as plain text without wrapping
    let link = cleanHtml(extractTag(content, 'link'));
    if (!link) {
      const linkMatch = content.match(/<link\s*\/?\s*>\s*(https?:\/\/[^\s<]+)/);
      if (linkMatch) link = linkMatch[1]!.trim();
    }

    const pubDate = extractTag(content, 'pubDate');
    const description = cleanHtml(extractTag(content, 'description'));

    if (!title || !link) continue;

    items.push({
      title,
      url: link,
      date: pubDate ? new Date(pubDate) : new Date(),
      excerpt: description.slice(0, 160),
      source,
    });
  }
  return items;
}

async function fetchRssFeed(
  feedUrl: string,
  source: NewsSource,
): Promise<ExternalNewsItem[]> {
  try {
    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(3000),
      headers: { 'User-Agent': 'VelikiBukovecWeb/1.0' },
    });
    if (!res.ok) {
      console.log(`[external-news] ${source.shortName}: HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const items = parseRss(xml, source);
    console.log(
      `[external-news] ${source.shortName}: ${items.length} items fetched`,
    );
    return items;
  } catch (err) {
    console.log(
      `[external-news] ${source.shortName}: failed -`,
      err instanceof Error ? err.message : 'unknown error',
    );
    return [];
  }
}

function parseKindergartenHtml(
  html: string,
  source: NewsSource,
): ExternalNewsItem[] {
  const items: ExternalNewsItem[] = [];
  const seen = new Set<string>();

  // Joomla renders article links to /index.php/novosti/slug
  const linkRegex =
    /<a[^>]*href="(\/index\.php\/novosti\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]!;
    const title = cleanHtml(match[2]!);

    // Skip navigation, pagination, and short text
    if (!title || title.length < 10 || seen.has(href)) continue;
    if (href.includes('start=') || href.includes('?format=')) continue;
    seen.add(href);

    // Try to find a date near this link - look for <time datetime="...">
    const surroundingStart = Math.max(0, match.index - 500);
    const surroundingEnd = Math.min(html.length, match.index + 500);
    const surrounding = html.slice(surroundingStart, surroundingEnd);

    let date = new Date();
    const timeMatch = surrounding.match(
      /<time[^>]*datetime="([^"]+)"/i,
    );
    if (timeMatch) {
      const parsed = new Date(timeMatch[1]!);
      if (!isNaN(parsed.getTime())) date = parsed;
    }

    items.push({
      title,
      url: `${source.url}${href}`,
      date,
      excerpt: '',
      source,
    });
  }

  return items;
}

async function fetchKindergartenNews(
  source: NewsSource,
): Promise<ExternalNewsItem[]> {
  try {
    const res = await fetch(
      'https://www.vrtic-krijesnica.hr/index.php/novosti',
      {
        signal: AbortSignal.timeout(3000),
        headers: { 'User-Agent': 'VelikiBukovecWeb/1.0' },
      },
    );
    if (!res.ok) {
      console.log(`[external-news] ${source.shortName}: HTTP ${res.status}`);
      return [];
    }
    const html = await res.text();
    const items = parseKindergartenHtml(html, source);
    console.log(
      `[external-news] ${source.shortName}: ${items.length} items scraped`,
    );
    return items;
  } catch (err) {
    console.log(
      `[external-news] ${source.shortName}: failed -`,
      err instanceof Error ? err.message : 'unknown error',
    );
    return [];
  }
}

export async function fetchAllExternalNews(): Promise<ExternalNewsItem[]> {
  const [parish, school, kindergarten] = await Promise.all([
    fetchRssFeed('https://zupa-sv-franje-asiskog.hr/feed/', PARISH_SOURCE),
    fetchRssFeed(
      'http://www.os-veliki-bukovec.skole.hr/?feed=rss2',
      SCHOOL_SOURCE,
    ),
    fetchKindergartenNews(KINDERGARTEN_SOURCE),
  ]);

  const all = [
    ...parish.slice(0, 5),
    ...school.slice(0, 5),
    ...kindergarten.slice(0, 5),
  ];

  // Sort by date, newest first
  all.sort((a, b) => b.date.getTime() - a.date.getTime());

  return all;
}

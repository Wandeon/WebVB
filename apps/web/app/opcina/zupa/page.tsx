import { pagesRepository } from '@repo/database';

import { ZupaClient } from './client';

import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Župa sv. Franje Asiškog',
  description: 'Informacije o župi, crkvama, kapelicama i grobljima na području općine Veliki Bukovec.',
};

// Tab order for sorting
const tabOrder = ['crkva', 'crkve-i-kapelice', 'zupni-ured', 'groblja'];

export default async function ZupaPage() {
  const pages = await pagesRepository.findBySlugPrefix('opcina/zupa');

  // Sort by predefined order
  const sortedPages = pages.sort((a, b) => {
    const aKey = a.slug.split('/').pop() ?? '';
    const bKey = b.slug.split('/').pop() ?? '';
    const aIdx = tabOrder.indexOf(aKey);
    const bIdx = tabOrder.indexOf(bKey);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  const pagesData = sortedPages.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
  }));

  return <ZupaClient pages={pagesData} />;
}

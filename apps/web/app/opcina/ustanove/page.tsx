import { pagesRepository } from '@repo/database';

import { UstanoveClient } from './client';

import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Ustanove',
  description: 'Javne ustanove na području općine Veliki Bukovec - škola i druge institucije.',
};

// Tab order for sorting
const tabOrder = ['skola'];

export default async function UstanovePage() {
  const pages = await pagesRepository.findBySlugPrefix('opcina/ustanove');

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

  return <UstanoveClient pages={pagesData} />;
}

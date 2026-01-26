import { postsRepository } from '@repo/database';
import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';
import { Suspense } from 'react';

import { NewsPageClient } from './news-page-client';

import type { NewsPageInitialData } from './news-page-client';
import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Vijesti',
  description: 'Pratite sve novosti i događanja iz Općine Veliki Bukovec.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/vijesti'),
  },
  openGraph: {
    title: 'Vijesti - Općina Veliki Bukovec',
    description: 'Pratite sve novosti i događanja iz Općine Veliki Bukovec.',
    type: 'website',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/vijesti'),
  },
};

function NewsPageFallback() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-4 w-64 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 mb-8 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-neutral-100" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}

async function getInitialNewsData(): Promise<NewsPageInitialData> {
  const [newsResult, featuredPost] = await Promise.all([
    postsRepository.findPublished({ page: 1, limit: 12 }),
    postsRepository.getFeaturedPost(),
  ]);

  const posts = newsResult.posts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    category: post.category,
    featuredImage: post.featuredImage,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  return {
    posts,
    pagination: newsResult.pagination,
    featuredPost: featuredPost
      ? {
          id: featuredPost.id,
          title: featuredPost.title,
          excerpt: featuredPost.excerpt,
          slug: featuredPost.slug,
          category: featuredPost.category,
          featuredImage: featuredPost.featuredImage,
          publishedAt: featuredPost.publishedAt ? featuredPost.publishedAt.toISOString() : null,
        }
      : null,
  };
}

export default async function NewsPage() {
  const initialData = await getInitialNewsData();

  return (
    <Suspense fallback={<NewsPageFallback />}>
      <NewsPageClient initialData={initialData} />
    </Suspense>
  );
}

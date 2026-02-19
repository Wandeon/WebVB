import { postsRepository, type PostWithAuthor } from '@repo/database';
import {
  buildCanonicalUrl,
  createArticleJsonLd,
  getPublicEnv,
  POST_CATEGORIES,
  stripHtmlTags,
  truncateText,
  withStaticParams,
} from '@repo/shared';
import {
  ArticleContent,
  ArticleHero,
  FadeIn,
  RelatedPosts,
  ShareButtons,
} from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { shouldSkipDatabase } from '@/lib/build-flags';

import { siteConfig } from '../../metadata';

import type { Metadata } from 'next';

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

const META_TITLE_MAX_LENGTH = 70;
const META_DESCRIPTION_MAX_LENGTH = 160;

async function fetchPostBySlug(slug: string): Promise<PostWithAuthor | null> {
  try {
    return await postsRepository.findBySlug(slug);
  } catch (error) {
    // Log the real error for debugging (build-time only, acceptable for static export)
    console.error('Database error fetching post:', error);
    // Re-throw with context but include original
    throw new Error(`Failed to fetch post "${slug}"`, { cause: error });
  }
}

async function fetchRelatedPosts(
  postId: string,
  category: string,
  limit: number
): Promise<PostWithAuthor[]> {
  try {
    return await postsRepository.getRelatedPosts(postId, category, limit);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  let post: PostWithAuthor | null = null;

  if (shouldSkipDatabase()) {
    return {
      title: 'Vijest trenutno nije dostupna',
      description: 'Vijest će biti dostupna nakon učitavanja sadržaja.',
    };
  }

  try {
    post = await fetchPostBySlug(slug);
  } catch {
    return {
      title: 'Vijest trenutno nije dostupna',
      description: 'Došlo je do greške prilikom dohvaćanja vijesti.',
    };
  }

  if (!post || !post.publishedAt) {
    return { title: 'Vijest nije pronađena' };
  }

  const titleText = truncateText(stripHtmlTags(post.title), META_TITLE_MAX_LENGTH);
  const description =
    post.excerpt ||
    truncateText(stripHtmlTags(post.content), META_DESCRIPTION_MAX_LENGTH);
  const fallbackImage = `${NEXT_PUBLIC_SITE_URL}/images/logo-large.png`;
  const ogImage = post.featuredImage ?? fallbackImage;
  const canonicalUrl = buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, `/vijesti/${post.slug}`);

  return {
    title: titleText,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: titleText,
      description,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      url: canonicalUrl,
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

// Required for static export - only these params are valid, all others 404
export const dynamicParams = false;
export const dynamic = 'force-static';

// Required for static export - generate all news pages at build time
export const generateStaticParams = withStaticParams(async () => {
  if (shouldSkipDatabase()) {
    return [];
  }

  const posts = await postsRepository.findPublishedForSitemap();
  return posts.map((post) => ({ slug: post.slug }));
}, {
  routeName: 'news detail pages',
  placeholder: { slug: '__ci_placeholder__' },
});

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;

  if (shouldSkipDatabase()) {
    notFound();
  }

  const post = await fetchPostBySlug(slug);

  if (!post || !post.publishedAt) {
    notFound();
  }

  const relatedPosts = await fetchRelatedPosts(post.id, post.category, 3);

  const categoryLabel =
    POST_CATEGORIES[post.category as keyof typeof POST_CATEGORIES] ||
    post.category;

  const articleUrl = `${NEXT_PUBLIC_SITE_URL}/vijesti/${post.slug}`;
  const description =
    post.excerpt ||
    truncateText(stripHtmlTags(post.content), META_DESCRIPTION_MAX_LENGTH);
  const structuredData = createArticleJsonLd({
    headline: post.title,
    description,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      '@type': post.author?.name ? 'Person' : 'Organization',
      name: post.author?.name ?? siteConfig.creator,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.creator,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.logo,
      },
    },
    mainEntityOfPage: articleUrl,
    image: post.featuredImage ? [post.featuredImage] : [siteConfig.ogImage],
  });

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/vijesti"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na vijesti
        </Link>
      </div>

      {/* Hero */}
      <FadeIn>
        <ArticleHero
          title={post.title}
          category={post.category}
          categoryLabel={categoryLabel}
          publishedAt={post.publishedAt}
          featuredImage={post.featuredImage}
        />
      </FadeIn>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          {/* Main content */}
          <div>
            <FadeIn>
              <ArticleContent content={post.content} />
            </FadeIn>

            <FadeIn>
              <div className="mt-8 border-t border-neutral-200 pt-6">
                <ShareButtons url={articleUrl} title={post.title} />
              </div>
            </FadeIn>
          </div>

          {/* Sidebar */}
          {relatedPosts.length > 0 && (
            <FadeIn direction="right">
              <RelatedPosts
                posts={relatedPosts.map((p: PostWithAuthor) => ({
                  title: p.title,
                  excerpt: p.excerpt,
                  slug: p.slug,
                  category: p.category,
                  categoryLabel:
                    POST_CATEGORIES[p.category as keyof typeof POST_CATEGORIES] ||
                    p.category,
                  featuredImage: p.featuredImage,
                  publishedAt: p.publishedAt,
                }))}
                className="lg:sticky lg:top-8"
              />
            </FadeIn>
          )}
        </div>
      </div>
    </>
  );
}

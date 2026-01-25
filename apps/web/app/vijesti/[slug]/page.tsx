
import { postsRepository, type PostWithAuthor } from '@repo/database';
import { POST_CATEGORIES } from '@repo/shared';
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

import type { Metadata } from 'next';

export const revalidate = 60;

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await postsRepository.findBySlug(slug);

  if (!post || !post.publishedAt) {
    return { title: 'Vijest nije pronađena' };
  }

  const description = post.excerpt || truncate(stripHtml(post.content), 160);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export async function generateStaticParams() {
  const { posts } = await postsRepository.findPublished({ limit: 100 });
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const post = await postsRepository.findBySlug(slug);

  if (!post || !post.publishedAt) {
    notFound();
  }

  const relatedPosts = await postsRepository.getRelatedPosts(
    post.id,
    post.category,
    3
  );

  const categoryLabel =
    POST_CATEGORIES[post.category as keyof typeof POST_CATEGORIES] ||
    post.category;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://velikibukovec.hr';
  const articleUrl = `${baseUrl}/vijesti/${post.slug}`;

  return (
    <>
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

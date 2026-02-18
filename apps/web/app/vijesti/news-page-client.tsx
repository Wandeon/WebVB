'use client';

import { POST_CATEGORIES, POST_CATEGORY_OPTIONS, getPublicEnv } from '@repo/shared';
import {
  CategoryFilter,
  ContentTypeSwitcher,
  FadeIn,
  Pagination,
  PostCardSkeleton,
  SectionHeader,
} from '@repo/ui';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featuredImage: string | null;
  publishedAt: Date | null;
}

interface SerializedPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featuredImage: string | null;
  publishedAt: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublicPostsResponse {
  success: boolean;
  data?: {
    posts: SerializedPost[];
    featuredPost: SerializedPost | null;
    pagination: PaginationData;
  };
  error?: {
    message: string;
  };
}

export interface ExternalColumn {
  label: string;
  fullName: string;
  color: string;
  accent: string;
  url: string;
  items: Array<{
    title: string;
    url: string;
    date: string;
    excerpt: string;
  }>;
}

export interface NewsPageInitialData {
  posts: SerializedPost[];
  featuredPost: SerializedPost | null;
  pagination: PaginationData;
}

interface NewsPageClientProps {
  initialData: NewsPageInitialData;
  externalColumns: ExternalColumn[];
}

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;
const FETCH_TIMEOUT_MS = 10_000;

const deserializePost = (post: SerializedPost): Post => ({
  ...post,
  publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
});

function formatDate(date: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}.`;
}

export function NewsPageClient({ initialData, externalColumns }: NewsPageClientProps) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>(
    initialData.posts.map(deserializePost)
  );
  const [featuredPost, setFeaturedPost] = useState<Post | null>(
    initialData.featuredPost ? deserializePost(initialData.featuredPost) : null
  );
  const [pagination, setPagination] = useState<PaginationData>(
    initialData.pagination
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryParam = searchParams.get('kategorija');
  const category = categoryParam && categoryParam in POST_CATEGORIES ? categoryParam : undefined;
  const pageParam = searchParams.get('stranica');
  const rawPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const shouldUseInitialData = useMemo(
    () => page === 1 && !category,
    [category, page]
  );

  useEffect(() => {
    if (shouldUseInitialData) {
      setPosts(initialData.posts.map(deserializePost));
      setFeaturedPost(
        initialData.featuredPost ? deserializePost(initialData.featuredPost) : null
      );
      setPagination(initialData.pagination);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    async function fetchPosts() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        params.set('page', String(page));
        params.set('limit', '12');

        const response = await fetch(
          `${API_URL}/api/public/posts?${params.toString()}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as PublicPostsResponse;

        if (!response.ok || !payload.success || !payload.data) {
          setErrorMessage('Ne možemo trenutno učitati vijesti. Pokušajte ponovno.');
          return;
        }

        setPosts(payload.data.posts.map(deserializePost));
        setPagination(payload.data.pagination);

        if (page === 1 && !category && payload.data.featuredPost) {
          setFeaturedPost(deserializePost(payload.data.featuredPost));
        } else {
          setFeaturedPost(null);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setErrorMessage('Ne možemo trenutno učitati vijesti. Pokušajte ponovno.');
      } finally {
        setIsLoading(false);
        window.clearTimeout(timeoutId);
      }
    }

    void fetchPosts();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [category, page, initialData, shouldUseInitialData]);

  const gridPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;
  const showCommunityNews = !category && page === 1 && externalColumns.length > 0;

  return (
    <>
      <ContentTypeSwitcher />

      <div className="py-8 pb-24 sm:pb-12 md:py-12">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader title="Vijesti" description="Pratite sve novosti i događanja iz Općine Veliki Bukovec" />
          </FadeIn>

          <CategoryFilter categories={POST_CATEGORY_OPTIONS} allLabel="Sve vijesti" className="mb-8" sticky />

          {errorMessage ? (
            <FadeIn>
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                {errorMessage}
              </div>
            </FadeIn>
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Compact hero - featured post */}
              {featuredPost && (
                <FadeIn>
                  <Link
                    href={`/vijesti/${featuredPost.slug}`}
                    className="group relative block overflow-hidden rounded-2xl bg-neutral-900"
                  >
                    <div className="aspect-[5/2] w-full overflow-hidden">
                      {featuredPost.featuredImage ? (
                        <img
                          src={featuredPost.featuredImage}
                          alt={featuredPost.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary-600 to-primary-800" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          {POST_CATEGORIES[featuredPost.category as keyof typeof POST_CATEGORIES] || featuredPost.category}
                        </span>
                        {featuredPost.publishedAt && (
                          <span className="text-xs text-white/70">
                            {formatDate(featuredPost.publishedAt)}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 line-clamp-2 text-lg font-bold text-white md:text-xl">
                        {featuredPost.title}
                      </h3>
                      {featuredPost.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/70">
                          {featuredPost.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </FadeIn>
              )}

              {/* Post grid - consistent cards */}
              {gridPosts.length > 0 ? (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gridPosts.map((post, index) => (
                      <FadeIn key={post.id} delay={index * 0.03}>
                        <Link href={`/vijesti/${post.slug}`} className="group block h-full">
                          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow group-hover:shadow-md">
                            <div className="aspect-[16/9] overflow-hidden">
                              {post.featuredImage ? (
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-primary-500 to-primary-700" />
                              )}
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                                  {POST_CATEGORIES[post.category as keyof typeof POST_CATEGORIES] || post.category}
                                </span>
                                {post.publishedAt && (
                                  <span className="text-[10px] text-neutral-400">
                                    {formatDate(post.publishedAt)}
                                  </span>
                                )}
                              </div>
                              <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-primary-600">
                                {post.title}
                              </h4>
                              {post.excerpt && (
                                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </FadeIn>
                    ))}
                  </div>

                  <FadeIn>
                    <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} className="mt-10" />
                  </FadeIn>
                </>
              ) : (
                <FadeIn>
                  <div className="mt-6 rounded-xl bg-neutral-100 py-12 text-center">
                    <p className="text-neutral-600">
                      {category ? 'Nema vijesti u odabranoj kategoriji.' : 'Trenutno nema objavljenih vijesti.'}
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                      {category ? (
                        <>
                          Pokušajte s drugom kategorijom ili{' '}
                          <Link href="/vijesti" className="text-primary-600 hover:underline">
                            pogledajte sve vijesti
                          </Link>
                          .
                        </>
                      ) : (
                        <>
                          Provjerite{' '}
                          <Link href="/obavijesti" className="text-primary-600 hover:underline">
                            obavijesti
                          </Link>{' '}
                          ili nas{' '}
                          <Link href="/kontakt" className="text-primary-600 hover:underline">
                            kontaktirajte
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  </div>
                </FadeIn>
              )}
            </>
          )}

          {/* Community news - 3 columns by source */}
          {showCommunityNews && (
            <div className="mt-14 border-t border-neutral-200 pt-10">
              <FadeIn>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Najnovije iz zajednice
                </h3>
              </FadeIn>
              <div className="mt-5 grid gap-6 md:grid-cols-3">
                {externalColumns.map((col, colIdx) => (
                  <FadeIn key={col.label} delay={colIdx * 0.05}>
                    <div>
                      <a
                        href={col.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2.5"
                      >
                        <span className={`h-6 w-1 rounded-full ${col.accent}`} />
                        <div>
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                            {col.label}
                          </h4>
                          <p className="text-xs text-neutral-400 group-hover:text-neutral-600">
                            {col.fullName}
                          </p>
                        </div>
                        <ExternalLink className="ml-auto h-3 w-3 text-neutral-300" />
                      </a>
                      <div className="mt-3 space-y-3">
                        {col.items.map((item) => {
                          const d = new Date(item.date);
                          const dateStr = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;
                          return (
                            <a
                              key={item.url}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-lg border border-neutral-100 bg-white p-4 transition-shadow hover:shadow-sm"
                            >
                              <p className="text-xs font-medium text-neutral-400">
                                {dateStr}
                              </p>
                              <h4 className="mt-1.5 line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-primary-600">
                                {item.title}
                              </h4>
                              {item.excerpt && (
                                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                                  {item.excerpt}
                                </p>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

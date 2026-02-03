'use client';

import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_CATEGORY_OPTIONS, getPublicEnv } from '@repo/shared';
import {
  CategoryFilter,
  ContentTypeSwitcher,
  FadeIn,
  Pagination,
  SectionHeader,
} from '@repo/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AnnouncementCard } from '@/components/announcements';

import type { AnnouncementCategory } from '@repo/shared';

interface Announcement {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  category: AnnouncementCategory;
  validFrom: Date | null;
  validUntil: Date | null;
  publishedAt: Date | null;
  attachments: { id: string }[];
}

interface SerializedAnnouncement {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  category: AnnouncementCategory;
  validFrom: string | null;
  validUntil: string | null;
  publishedAt: string | null;
  attachments: { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string }[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublicAnnouncementsResponse {
  success: boolean;
  data?: {
    announcements: SerializedAnnouncement[];
    pagination: PaginationData;
  };
  error?: {
    message: string;
  };
}

export interface AnnouncementsPageInitialData {
  announcements: SerializedAnnouncement[];
  pagination: PaginationData;
}

interface AnnouncementsPageClientProps {
  initialData: AnnouncementsPageInitialData;
}

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;
const FETCH_TIMEOUT_MS = 10_000;

const deserializeAnnouncement = (announcement: SerializedAnnouncement): Announcement => ({
  ...announcement,
  validFrom: announcement.validFrom ? new Date(announcement.validFrom) : null,
  validUntil: announcement.validUntil ? new Date(announcement.validUntil) : null,
  publishedAt: announcement.publishedAt ? new Date(announcement.publishedAt) : null,
});

function AnnouncementCardSkeleton() {
  return (
    <div className="h-48 animate-pulse rounded-lg bg-neutral-200" />
  );
}

export function AnnouncementsPageClient({ initialData }: AnnouncementsPageClientProps) {
  const searchParams = useSearchParams();
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    initialData.announcements.map(deserializeAnnouncement)
  );
  const [pagination, setPagination] = useState<PaginationData>(
    initialData.pagination
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryParam = searchParams.get('kategorija');
  const category =
    categoryParam && categoryParam in ANNOUNCEMENT_CATEGORIES
      ? (categoryParam as AnnouncementCategory)
      : undefined;
  const pageParam = searchParams.get('stranica');
  const rawPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const shouldUseInitialData = useMemo(
    () => page === 1 && !category,
    [category, page]
  );

  useEffect(() => {
    if (shouldUseInitialData) {
      setAnnouncements(initialData.announcements.map(deserializeAnnouncement));
      setPagination(initialData.pagination);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    async function fetchAnnouncements() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        params.set('page', String(page));
        params.set('limit', '12');

        const response = await fetch(
          `${API_URL}/api/public/announcements?${params.toString()}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as PublicAnnouncementsResponse;

        if (!response.ok || !payload.success || !payload.data) {
          setErrorMessage(
            'Ne možemo trenutno učitati obavijesti. Pokušajte ponovno.'
          );
          return;
        }

        setAnnouncements(payload.data.announcements.map(deserializeAnnouncement));
        setPagination(payload.data.pagination);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setErrorMessage(
          'Ne možemo trenutno učitati obavijesti. Pokušajte ponovno.'
        );
      } finally {
        setIsLoading(false);
        window.clearTimeout(timeoutId);
      }
    }

    void fetchAnnouncements();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [category, page, initialData, shouldUseInitialData]);

  return (
    <>
      <ContentTypeSwitcher />

      <div className="py-8 pb-24 sm:pb-12 md:py-12">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Obavijesti"
              description="Natječaji, oglasi, javni pozivi i službene obavijesti Općine Veliki Bukovec"
            />
          </FadeIn>

          <CategoryFilter
            categories={ANNOUNCEMENT_CATEGORY_OPTIONS}
            allLabel="Sve obavijesti"
            className="mb-8"
            sticky
          />

        {errorMessage ? (
          <FadeIn>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              {errorMessage}
            </div>
          </FadeIn>
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <AnnouncementCardSkeleton key={i} />
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement, index) => (
                <FadeIn key={announcement.id} delay={index * 0.05}>
                  <AnnouncementCard
                    title={announcement.title}
                    excerpt={announcement.excerpt}
                    slug={announcement.slug}
                    category={announcement.category}
                    validFrom={announcement.validFrom}
                    validUntil={announcement.validUntil}
                    publishedAt={announcement.publishedAt}
                    attachmentCount={announcement.attachments.length}
                  />
                </FadeIn>
              ))}
            </div>
            <FadeIn>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                className="mt-12"
              />
            </FadeIn>
          </>
        ) : (
          <FadeIn>
            <div className="rounded-lg bg-neutral-100 py-12 text-center">
              <p className="text-neutral-600">
                {category
                  ? 'Nema obavijesti u odabranoj kategoriji.'
                  : 'Trenutno nema objavljenih obavijesti.'}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                {category ? (
                  <>
                    Pokušajte s drugom kategorijom ili{' '}
                    <Link href="/obavijesti" className="text-primary-600 hover:underline">
                      pogledajte sve obavijesti
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Za službene informacije pratite{' '}
                    <Link href="/vijesti" className="text-primary-600 hover:underline">
                      vijesti
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
      </div>
    </div>
    </>
  );
}

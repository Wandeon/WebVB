'use client';

import { getPublicEnv } from '@repo/shared';
import { FadeIn, GalleryCard, Pagination } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Gallery {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  eventDate: Date | null;
  imageCount: number;
}

interface SerializedGallery {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  eventDate: string | null;
  imageCount: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublicGalleriesResponse {
  success: boolean;
  data?: {
    galleries: SerializedGallery[];
    pagination: PaginationData;
  };
  error?: {
    message: string;
  };
}

export interface GalleryPageInitialData {
  galleries: SerializedGallery[];
  pagination: PaginationData;
}

interface GalleryPageClientProps {
  initialData: GalleryPageInitialData;
}

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;
const FETCH_TIMEOUT_MS = 10_000;

const deserializeGallery = (gallery: SerializedGallery): Gallery => ({
  ...gallery,
  eventDate: gallery.eventDate ? new Date(gallery.eventDate) : null,
});

export function GalleryPageClient({ initialData }: GalleryPageClientProps) {
  const searchParams = useSearchParams();
  const [galleries, setGalleries] = useState<Gallery[]>(
    initialData.galleries.map(deserializeGallery)
  );
  const [pagination, setPagination] = useState<PaginationData>(
    initialData.pagination
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageParam = searchParams.get('stranica');
  const rawPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const shouldUseInitialData = useMemo(() => page === 1, [page]);

  useEffect(() => {
    if (shouldUseInitialData) {
      setGalleries(initialData.galleries.map(deserializeGallery));
      setPagination(initialData.pagination);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    async function fetchGalleries() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(
          `${API_URL}/api/public/galleries?page=${page}&limit=12`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as PublicGalleriesResponse;

        if (!response.ok || !payload.success || !payload.data) {
          setErrorMessage('Ne možemo trenutno učitati galerije. Pokušajte ponovno.');
          return;
        }

        setGalleries(payload.data.galleries.map(deserializeGallery));
        setPagination(payload.data.pagination);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setErrorMessage('Ne možemo trenutno učitati galerije. Pokušajte ponovno.');
      } finally {
        setIsLoading(false);
        window.clearTimeout(timeoutId);
      }
    }

    void fetchGalleries();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [initialData, page, shouldUseInitialData]);

  return (
    <>
      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na početnu
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 pb-6">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold text-neutral-900 md:text-4xl">
            Galerija
          </h1>
          <p className="mt-2 text-neutral-600">
            Foto galerija Općine Veliki Bukovec
          </p>
        </FadeIn>
      </div>

      {/* Gallery grid */}
      <div className="container mx-auto px-4 pb-12">
        {errorMessage ? (
          <FadeIn>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              {errorMessage}
            </div>
          </FadeIn>
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-neutral-200" />
            ))}
          </div>
        ) : galleries.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleries.map((gallery, index) => (
                <FadeIn key={gallery.id} delay={index * 0.05}>
                  <GalleryCard
                    name={gallery.name}
                    slug={gallery.slug}
                    coverImage={gallery.coverImage}
                    imageCount={gallery.imageCount}
                    eventDate={gallery.eventDate}
                  />
                </FadeIn>
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <FadeIn>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  className="mt-12"
                />
              </FadeIn>
            )}
          </>
        ) : (
          <FadeIn>
            <div className="rounded-lg bg-neutral-100 py-12 text-center">
              <p className="text-neutral-600">Trenutno nema dostupnih galerija.</p>
            </div>
          </FadeIn>
        )}
      </div>
    </>
  );
}

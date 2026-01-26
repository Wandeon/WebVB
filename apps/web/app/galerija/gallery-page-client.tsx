'use client';

import { FadeIn, GalleryCard, Pagination } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Gallery {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  eventDate: Date | null;
  _count: { images: number };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function GalleryPageClient() {
  const searchParams = useSearchParams();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const pageParam = searchParams.get('stranica');
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  useEffect(() => {
    async function fetchGalleries() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/public/galleries?page=${page > 0 ? page : 1}&limit=12`);
        if (response.ok) {
          const data = await response.json();
          setGalleries(data.galleries.map((g: { id: string; name: string; slug: string; coverImage: string | null; eventDate: string | null; _count: { images: number } }) => ({
            ...g,
            eventDate: g.eventDate ? new Date(g.eventDate) : null,
          })));
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error fetching galleries:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGalleries();
  }, [page]);

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
        {isLoading ? (
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
                    imageCount={gallery._count.images}
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

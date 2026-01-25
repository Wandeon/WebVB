import { galleriesRepository } from '@repo/database';
import { FadeIn, GalleryCard, Pagination } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Galerija',
  description: 'Foto galerija Općine Veliki Bukovec.',
  openGraph: {
    title: 'Galerija - Općina Veliki Bukovec',
    description: 'Foto galerija Općine Veliki Bukovec.',
    type: 'website',
  },
};

interface GalleryPageProps {
  searchParams: Promise<{
    stranica?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const page = params.stranica ? parseInt(params.stranica, 10) : 1;

  const { galleries, pagination } = await galleriesRepository.findPublished({
    page,
    limit: 12,
  });

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
        {galleries.length > 0 ? (
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

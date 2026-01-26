import { galleriesRepository } from '@repo/database';
import { buildCanonicalUrl, getPublicEnv, withStaticParams } from '@repo/shared';
import { FadeIn, PhotoGrid } from '@repo/ui';
import { ArrowLeft, Calendar, Images } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

// Allow dynamic params for static export when database is empty
// With output: export, non-generated routes will 404 anyway (no server)
export const dynamicParams = true;
export const dynamic = 'force-static';

// Required for static export - generate all gallery pages at build time
export const generateStaticParams = withStaticParams(async () => {
  const galleries = await galleriesRepository.findAllForSitemap();
  return galleries.map((gallery) => ({ slug: gallery.slug }));
}, { routeName: 'gallery detail pages' });

interface GalleryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: GalleryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await galleriesRepository.findBySlug(slug);

  if (!gallery) {
    return { title: 'Galerija nije pronađena' };
  }

  const description = gallery.description
    ? gallery.description.slice(0, 160)
    : `Foto galerija: ${gallery.name}`;
  const canonicalUrl = buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, `/galerija/${gallery.slug}`);

  return {
    title: gallery.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${gallery.name} - Galerija - Općina Veliki Bukovec`,
      description,
      type: 'website',
      url: canonicalUrl,
      ...(gallery.coverImage && { images: [gallery.coverImage] }),
    },
  };
}

export default async function GalleryDetailPage({
  params,
}: GalleryDetailPageProps) {
  const { slug } = await params;
  const gallery = await galleriesRepository.findBySlug(slug);

  if (!gallery) {
    notFound();
  }

  const formattedDate = gallery.eventDate
    ? new Intl.DateTimeFormat('hr-HR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(gallery.eventDate))
    : null;

  return (
    <>
      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/galerija"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na galeriju
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 pb-6">
        <FadeIn>
          <h1 className="font-display text-2xl font-bold text-neutral-900 md:text-3xl">
            {gallery.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <Images className="h-4 w-4" />
              <span>{gallery._count.images} fotografija</span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
          {gallery.description && (
            <p className="mt-3 text-neutral-600">{gallery.description}</p>
          )}
        </FadeIn>
      </div>

      {/* Photo grid */}
      <div className="container mx-auto px-4 pb-12">
        {gallery.images.length > 0 ? (
          <FadeIn delay={0.1}>
            <PhotoGrid
              images={gallery.images.map((img) => ({
                id: img.id,
                imageUrl: img.imageUrl,
                thumbnailUrl: img.thumbnailUrl,
                caption: img.caption,
              }))}
            />
          </FadeIn>
        ) : (
          <FadeIn>
            <div className="rounded-lg bg-neutral-100 py-12 text-center">
              <p className="text-neutral-600">Ova galerija još nema fotografija.</p>
            </div>
          </FadeIn>
        )}
      </div>
    </>
  );
}

import { galleriesRepository } from '@repo/database';
import { Toaster } from '@repo/ui';
import { notFound } from 'next/navigation';

import { GalleryForm, ImageManager } from '@/components/galleries';
import { Breadcrumbs } from '@/components/layout';

import type { GalleryImage } from '@repo/shared';

interface EditGalleryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditGalleryPageProps) {
  const { id } = await params;
  const gallery = await galleriesRepository.findById(id);

  return {
    title: gallery ? `Uredi: ${gallery.name} | Admin` : 'Galerija nije pronadena',
  };
}

export default async function EditGalleryPage({ params }: EditGalleryPageProps) {
  const { id } = await params;
  const gallery = await galleriesRepository.findById(id);

  if (!gallery) {
    notFound();
  }

  // Transform images for ImageManager (Next.js serializes Date to ISO string)
  const initialImages = gallery.images.map((img) => ({
    id: img.id,
    galleryId: img.galleryId,
    imageUrl: img.imageUrl,
    thumbnailUrl: img.thumbnailUrl,
    caption: img.caption,
    sortOrder: img.sortOrder,
    createdAt: img.createdAt,
  })) as unknown as GalleryImage[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Uredi galeriju
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Galerije', href: '/galleries' },
            { label: gallery.name },
          ]}
          className="mt-1"
        />
      </div>

      {/* Detalji galerije */}
      <section aria-labelledby="gallery-details-heading">
        <h2 id="gallery-details-heading" className="sr-only">
          Detalji galerije
        </h2>
        <GalleryForm
          initialData={{
            id: gallery.id,
            name: gallery.name,
            description: gallery.description,
            eventDate: gallery.eventDate?.toISOString() ?? null,
          }}
        />
      </section>

      {/* Slike */}
      <section aria-labelledby="gallery-images-heading">
        <h2 id="gallery-images-heading" className="sr-only">
          Slike
        </h2>
        <ImageManager
          galleryId={gallery.id}
          initialImages={initialImages}
          initialCoverImage={gallery.coverImage}
        />
      </section>

      <Toaster />
    </div>
  );
}

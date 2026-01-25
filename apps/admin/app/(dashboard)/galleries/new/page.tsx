import { Toaster } from '@repo/ui';

import { GalleryForm } from '@/components/galleries';
import { Breadcrumbs } from '@/components/layout';

export const metadata = {
  title: 'Nova galerija | Admin',
};

export default function NewGalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Nova galerija
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Galerije', href: '/galleries' },
            { label: 'Nova galerija' },
          ]}
          className="mt-1"
        />
      </div>
      <GalleryForm />
      <Toaster />
    </div>
  );
}

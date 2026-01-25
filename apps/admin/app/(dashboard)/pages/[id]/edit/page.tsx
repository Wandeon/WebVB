import { pagesRepository } from '@repo/database';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/layout';
import { PageForm } from '@/components/pages';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditPageProps) {
  const { id } = await params;
  const page = await pagesRepository.findById(id);

  return {
    title: page ? `Uredi: ${page.title} | Admin` : 'Stranica nije pronađena',
  };
}

export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const page = await pagesRepository.findById(id);

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Uredi stranicu
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Stranice', href: '/pages' },
            { label: 'Uredi stranicu' },
          ]}
          className="mt-1"
        />
      </div>
      <PageForm
        initialData={{
          id: page.id,
          title: page.title,
          content: page.content,
          parentId: page.parentId,
          menuOrder: page.menuOrder,
        }}
      />
    </div>
  );
}

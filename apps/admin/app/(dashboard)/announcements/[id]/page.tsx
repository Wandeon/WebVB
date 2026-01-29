import { db } from '@repo/database';
import { type AnnouncementCategory } from '@repo/shared';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/layout';
import { AnnouncementForm } from '@/components/announcements';

interface EditAnnouncementPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({
  params,
}: EditAnnouncementPageProps) {
  const { id } = await params;

  const announcement = await db.announcement.findUnique({
    where: { id },
    include: {
      attachments: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Uredi obavijest
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Obavijesti', href: '/announcements' },
            { label: announcement.title },
          ]}
          className="mt-1"
        />
      </div>

      <AnnouncementForm
        initialData={{
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          excerpt: announcement.excerpt,
          category: announcement.category as AnnouncementCategory,
          validFrom: announcement.validFrom,
          validUntil: announcement.validUntil,
          publishedAt: announcement.publishedAt,
          attachments: announcement.attachments.map((att) => ({
            id: att.id,
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
          })),
        }}
      />
    </div>
  );
}

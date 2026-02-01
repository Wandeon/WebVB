import { AnnouncementForm } from '@/components/announcements';
import { Breadcrumbs } from '@/components/layout';

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Nova obavijest
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Obavijesti', href: '/announcements' },
            { label: 'Nova obavijest' },
          ]}
          className="mt-1"
        />
      </div>

      <AnnouncementForm />
    </div>
  );
}

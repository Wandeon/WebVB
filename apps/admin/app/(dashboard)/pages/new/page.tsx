import { Breadcrumbs } from '@/components/layout';
import { PageForm } from '@/components/pages';

export const metadata = {
  title: 'Nova stranica | Admin',
};

export default function NewPagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Nova stranica
        </h1>
        <Breadcrumbs
          items={[
            { label: 'Stranice', href: '/pages' },
            { label: 'Nova stranica' },
          ]}
          className="mt-1"
        />
      </div>
      <PageForm />
    </div>
  );
}

// apps/web/app/newsletter/odjava/page.tsx
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { UnsubscribeClient } from './unsubscribe-client';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Odjava s newslettera | Općina Veliki Bukovec',
  description: 'Odjavite se s newslettera Općine Veliki Bukovec.',
};

function UnsubscribeLoading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary-600" />
        <h1 className="mt-6 font-display text-2xl font-bold text-neutral-900">
          Učitavam...
        </h1>
        <p className="mt-2 text-neutral-600">
          Molimo pričekajte.
        </p>
      </div>
    </main>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeLoading />}>
      <UnsubscribeClient />
    </Suspense>
  );
}

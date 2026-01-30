// apps/web/app/newsletter/potvrda/page.tsx
import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

import { ConfirmationClient } from './confirmation-client';

export const metadata: Metadata = {
  title: 'Potvrda pretplate - Newsletter | Općina Veliki Bukovec',
  description: 'Potvrdite svoju pretplatu na newsletter Općine Veliki Bukovec.',
};

function ConfirmationLoading() {
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

export default function NewsletterConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationClient />
    </Suspense>
  );
}

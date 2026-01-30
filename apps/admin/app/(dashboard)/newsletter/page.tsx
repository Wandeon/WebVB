import { Suspense } from 'react';

import { NewsletterCompose } from './newsletter-compose';

export const metadata = {
  title: 'Newsletter | Admin',
};

export default function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Newsletter</h1>
        <p className="mt-1 text-neutral-600">
          Sastavi i pošalji newsletter pretplatnicima
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-96 bg-neutral-100 rounded-lg" />}>
        <NewsletterCompose />
      </Suspense>
    </div>
  );
}

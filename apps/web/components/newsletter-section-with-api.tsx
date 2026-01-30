'use client';

import { NewsletterSection } from '@repo/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function handleNewsletterSubmit(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/public/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Subscription failed');
  }
}

export function NewsletterSectionWithApi() {
  return <NewsletterSection onSubmit={handleNewsletterSubmit} />;
}

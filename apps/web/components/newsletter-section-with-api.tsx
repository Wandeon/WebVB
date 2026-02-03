'use client';

import { getPublicEnv } from '@repo/shared';
import { NewsletterSection } from '@repo/ui';

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;

interface SubscribeResponse {
  success: boolean;
  error?: {
    message: string;
  };
}

async function handleNewsletterSubmit(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/public/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = (await response.json()) as SubscribeResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.error?.message ?? 'Subscription failed');
  }
}

export function NewsletterSectionWithApi() {
  return <NewsletterSection onSubmit={handleNewsletterSubmit} />;
}

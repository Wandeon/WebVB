// apps/web/app/newsletter/odjava/page.tsx
import { Metadata } from 'next';

import { UnsubscribeClient } from './unsubscribe-client';

export const metadata: Metadata = {
  title: 'Odjava s newslettera | Općina Veliki Bukovec',
  description: 'Odjavite se s newslettera Općine Veliki Bukovec.',
};

export default function NewsletterUnsubscribePage() {
  return <UnsubscribeClient />;
}

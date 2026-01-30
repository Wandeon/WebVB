// apps/web/app/newsletter/potvrda/page.tsx
import { Metadata } from 'next';

import { ConfirmationClient } from './confirmation-client';

export const metadata: Metadata = {
  title: 'Potvrda pretplate - Newsletter | Općina Veliki Bukovec',
  description: 'Potvrdite svoju pretplatu na newsletter Općine Veliki Bukovec.',
};

export default function NewsletterConfirmationPage() {
  return <ConfirmationClient />;
}

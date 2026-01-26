import { buildCanonicalUrl, getPublicEnv } from '@repo/shared';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

export const metadata: Metadata = {
  title: 'Vijesti',
  description: 'Pratite sve novosti, obavijesti i događanja iz Općine Veliki Bukovec. Budite u tijeku s lokalnim aktualnostima.',
  alternates: {
    canonical: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/vijesti'),
  },
  openGraph: {
    title: 'Vijesti | Općina Veliki Bukovec',
    description: 'Pratite sve novosti, obavijesti i događanja iz Općine Veliki Bukovec.',
    url: buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, '/vijesti'),
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

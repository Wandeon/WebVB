import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vijesti',
  description: 'Pratite sve novosti, obavijesti i događanja iz Općine Veliki Bukovec. Budite u tijeku s lokalnim aktualnostima.',
  openGraph: {
    title: 'Vijesti | Općina Veliki Bukovec',
    description: 'Pratite sve novosti, obavijesti i događanja iz Općine Veliki Bukovec.',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

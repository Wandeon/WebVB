import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Općina',
  description: 'Upoznajte Općinu Veliki Bukovec - povijest, turizam, naselja i sve o našoj zajednici u srcu Podravine',
  openGraph: {
    title: 'Općina | Veliki Bukovec',
    description: 'Upoznajte Općinu Veliki Bukovec - povijest, turizam, naselja i sve o našoj zajednici u srcu Podravine',
  },
};

export default function OpcinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

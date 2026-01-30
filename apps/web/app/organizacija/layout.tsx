import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organizacija',
  description: 'Organizacija Općine Veliki Bukovec - općinski načelnik, Općinsko vijeće, Jedinstveni upravni odjel i kontakt podaci',
  openGraph: {
    title: 'Organizacija | Općina Veliki Bukovec',
    description: 'Načelnik, Općinsko vijeće i uprava - sve o organizaciji lokalne samouprave',
  },
};

export default function OrganizacijaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

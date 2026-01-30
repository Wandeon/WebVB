import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Naselja',
  description: 'Upoznajte naselja Općine Veliki Bukovec - Veliki Bukovec sa dvorcem Drašković, Dubovica uz rijeku Plitvicu i Kapela Podravska',
  openGraph: {
    title: 'Naselja | Općina Veliki Bukovec',
    description: 'Tri naselja s bogatom tradicijom - Veliki Bukovec, Dubovica i Kapela Podravska',
  },
};

export default function NaseljaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

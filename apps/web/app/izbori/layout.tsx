import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Izbori',
  description: 'Pregled svih izbora na području Općine Veliki Bukovec - lokalni izbori, parlamentarni, predsjednički i izbori za EU parlament s rezultatima i dokumentima',
  openGraph: {
    title: 'Izbori | Općina Veliki Bukovec',
    description: 'Arhiva svih izbora - lokalni, parlamentarni, predsjednički i EU izbori',
  },
};

export default function IzboriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

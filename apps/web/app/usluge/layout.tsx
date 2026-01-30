import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usluge',
  description: 'Usluge Općine Veliki Bukovec - komunalno gospodarstvo, financije, obrasci za građane i potpore udrugama',
  openGraph: {
    title: 'Usluge | Općina Veliki Bukovec',
    description: 'Komunalne usluge, financijska transparentnost, obrasci i potpore za udruge',
  },
};

export default function UslugeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

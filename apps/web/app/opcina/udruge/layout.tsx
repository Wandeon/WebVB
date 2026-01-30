import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Udruge i društva',
  description: 'Aktivne udruge Općine Veliki Bukovec - DVD-ovi, nogometni klubovi, lovačka i ribolovna društva, udruge žena i umirovljenika',
  openGraph: {
    title: 'Udruge i društva | Općina Veliki Bukovec',
    description: 'Aktivna zajednica s bogatom tradicijom volontiranja - vatrogasci, sportaši i kulturne udruge',
  },
};

export default function UdrugeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

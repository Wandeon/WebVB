// apps/web/app/naselja/page.tsx
import Image from 'next/image';
import Link from 'next/link';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Naselja | Općina Veliki Bukovec',
  description: 'Upoznajte naselja Općine Veliki Bukovec: Veliki Bukovec, Dubovica i Kapela Podravska',
};

const villages = [
  {
    id: 'veliki-bukovec',
    name: 'Veliki Bukovec',
    description: 'Administrativno središte općine s bogatom poviješću i tradicijom cvjećarstva.',
    image: '/images/hero/veliki-bukovec-hero-1.jpg',
    href: '/naselja/veliki-bukovec',
  },
  {
    id: 'dubovica',
    name: 'Dubovica',
    description: 'Mirno selo poznato po kapeli Uzvišenja svetog Križa i poljoprivrednoj tradiciji.',
    image: '/images/hero/veliki-bukovec-hero-3.jpg',
    href: '/naselja/dubovica',
  },
  {
    id: 'kapela',
    name: 'Kapela Podravska',
    description: 'Naselje uz rijeku Bednju s dugom poviješću i aktivnom zajednicom.',
    image: '/images/hero/veliki-bukovec-hero-2.jpg',
    href: '/naselja/kapela',
  },
];

export default function NaseljaPage() {
  return (
    <PageLayoutV2
      title="Naselja"
      subtitle="Tri naselja, jedna zajednica"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
    >
      <p className="lead">
        Općina Veliki Bukovec obuhvaća tri naselja koja zajedno čine jedinstvenu
        podravsku zajednicu s bogatom tradicijom i živom sadašnjošću.
      </p>

      <div className="not-prose mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {villages.map((village) => (
          <Link
            key={village.id}
            href={village.href}
            className="group overflow-hidden rounded-xl border border-neutral-200 transition-all hover:border-primary-300 hover:shadow-lg"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={village.image}
                alt={village.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">{village.name}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-neutral-600">{village.description}</p>
              <span className="mt-3 inline-flex items-center text-sm font-medium text-primary-600">
                Saznaj više →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </PageLayoutV2>
  );
}

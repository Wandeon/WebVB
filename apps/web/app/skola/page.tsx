// apps/web/app/skola/page.tsx
import { pagesRepository } from '@repo/database';
import { ArticleContent } from '@repo/ui';
import { Calendar, GraduationCap, Mail, MapPin, Phone, Users } from 'lucide-react';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { PageSection } from '../../lib/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Osnovna škola | Općina Veliki Bukovec',
  description:
    'Informacije o osnovnoj školi na području općine Veliki Bukovec - obrazovanje, aktivnosti i kontakt podaci.',
};

// Section configuration for database content
const sectionConfig: Record<string, { label: string; icon: typeof GraduationCap }> = {
  skola: { label: 'O školi', icon: GraduationCap },
  aktivnosti: { label: 'Aktivnosti', icon: Calendar },
  ucenici: { label: 'Učenici', icon: Users },
  kontakt: { label: 'Kontakt', icon: Phone },
};

const sectionOrder = ['skola', 'aktivnosti', 'ucenici', 'kontakt'];

// Helper to extract the last segment of a slug
function getSlugKey(slug: string): string {
  return slug.split('/').pop() ?? '';
}

// Fallback sections when no database content is available
const fallbackSections: PageSection[] = [
  { id: 'o-skoli', label: 'O školi' },
  { id: 'kontakt', label: 'Kontakt' },
];

export default async function SkolaPage() {
  const pages = await pagesRepository.findBySlugPrefix('opcina/ustanove');

  // Filter for school-related content
  const schoolPages = pages.filter((page) => {
    const slugKey = getSlugKey(page.slug);
    return slugKey === 'skola' || page.title.toLowerCase().includes('škol');
  });

  // Sort by predefined order
  const sortedPages = schoolPages.sort((a, b) => {
    const aKey = getSlugKey(a.slug);
    const bKey = getSlugKey(b.slug);
    const aIdx = sectionOrder.indexOf(aKey);
    const bIdx = sectionOrder.indexOf(bKey);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  // Build page sections dynamically from database content
  const pageSections: PageSection[] =
    sortedPages.length > 0
      ? sortedPages.map((page) => {
          const slugKey = getSlugKey(page.slug);
          const config = sectionConfig[slugKey];
          return {
            id: slugKey,
            label: config?.label ?? page.title,
          };
        })
      : fallbackSections;

  // Render database content
  if (sortedPages.length > 0) {
    return (
      <PageLayoutV2
        title="Osnovna škola"
        subtitle="Obrazovanje u općini Veliki Bukovec"
        heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
        sections={pageSections}
      >
        {sortedPages.map((page) => {
          const slugKey = getSlugKey(page.slug);
          const config = sectionConfig[slugKey];
          const IconComponent = config?.icon ?? GraduationCap;

          return (
            <section key={page.id} id={slugKey} className="scroll-mt-24">
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100"
                  aria-hidden="true"
                >
                  <IconComponent className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="!mt-0 !border-0 !pb-0">{page.title}</h2>
              </div>
              <ArticleContent content={page.content} />
            </section>
          );
        })}
      </PageLayoutV2>
    );
  }

  // Fallback static content when no database content is available
  return (
    <PageLayoutV2
      title="Osnovna škola"
      subtitle="Obrazovanje u općini Veliki Bukovec"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={fallbackSections}
    >
      {/* O školi section */}
      <section id="o-skoli" className="scroll-mt-24">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100"
            aria-hidden="true"
          >
            <GraduationCap className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="!mt-0 !border-0 !pb-0">O školi</h2>
        </div>
        <p>
          Osnovna škola na području općine Veliki Bukovec pruža kvalitetno obrazovanje za
          učenike od prvog do osmog razreda. Škola je posvećena razvoju svakog učenika
          kroz suvremene nastavne metode i bogat izvannastavni program.
        </p>

        {/* Stats cards */}
        <div className="not-prose mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
            <div className="mb-2 flex justify-center">
              <Users className="h-8 w-8 text-primary-600" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">100+</div>
            <div className="text-sm text-neutral-500">Učenika</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
            <div className="mb-2 flex justify-center">
              <GraduationCap className="h-8 w-8 text-primary-600" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">15+</div>
            <div className="text-sm text-neutral-500">Nastavnika</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
            <div className="mb-2 flex justify-center">
              <Calendar className="h-8 w-8 text-primary-600" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">50+</div>
            <div className="text-sm text-neutral-500">Godina tradicije</div>
          </div>
        </div>
      </section>

      {/* Kontakt section */}
      <section id="kontakt" className="scroll-mt-24">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100"
            aria-hidden="true"
          >
            <Phone className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="!mt-0 !border-0 !pb-0">Kontakt</h2>
        </div>

        <div className="not-prose rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="mb-4 font-semibold text-neutral-900">Kontakt podaci škole</h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-neutral-500">Adresa</dt>
                <dd className="font-medium text-neutral-900">
                  Veliki Bukovec, 42231 Veliki Bukovec
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-neutral-500">Telefon</dt>
                <dd className="font-medium text-neutral-900">042/XXX-XXX</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-neutral-500">E-mail</dt>
                <dd className="font-medium text-neutral-900">skola@velikibukovec.hr</dd>
              </div>
            </div>
          </dl>
        </div>
      </section>
    </PageLayoutV2>
  );
}

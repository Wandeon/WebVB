// apps/web/app/zupa/page.tsx
import { pagesRepository } from '@repo/database';
import { ArticleContent } from '@repo/ui';
import { Book, Church, Cross, MapPin } from 'lucide-react';

import { PageLayoutV2 } from '../../components/page-layout-v2';

import type { Metadata } from 'next';
import type { PageSection } from '../../lib/navigation';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Župa sv. Franje Asiškog | Općina Veliki Bukovec',
  description:
    'Informacije o župi, crkvama, kapelicama i grobljima na području općine Veliki Bukovec.',
};

// Section order and configuration
const sectionConfig: Record<string, { label: string; icon: typeof Church }> = {
  crkva: { label: 'Crkva', icon: Church },
  'crkve-i-kapelice': { label: 'Crkve i kapelice', icon: Cross },
  'zupni-ured': { label: 'Župni ured', icon: Book },
  groblja: { label: 'Groblja', icon: MapPin },
};

const sectionOrder = ['crkva', 'crkve-i-kapelice', 'zupni-ured', 'groblja'];

// Helper to extract the last segment of a slug
function getSlugKey(slug: string): string {
  return slug.split('/').pop() ?? '';
}

export default async function ZupaPage() {
  const pages = await pagesRepository.findBySlugPrefix('opcina/zupa');

  // Sort by predefined order
  const sortedPages = pages.sort((a, b) => {
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
  const pageSections: PageSection[] = sortedPages.map((page) => {
    const slugKey = getSlugKey(page.slug);
    const config = sectionConfig[slugKey];
    return {
      id: slugKey,
      label: config?.label ?? page.title,
    };
  });

  // Handle empty state
  if (sortedPages.length === 0) {
    return (
      <PageLayoutV2
        title="Župa sv. Franje Asiškog"
        subtitle="Duhovno središte općine Veliki Bukovec"
        heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
        sections={[]}
      >
        <p className="text-neutral-500">Nema dostupnog sadržaja.</p>
      </PageLayoutV2>
    );
  }

  return (
    <PageLayoutV2
      title="Župa sv. Franje Asiškog"
      subtitle="Duhovno središte općine Veliki Bukovec"
      heroImage="/images/hero/veliki-bukovec-hero-1.jpg"
      sections={pageSections}
    >
      {sortedPages.map((page) => {
        const slugKey = getSlugKey(page.slug);
        const config = sectionConfig[slugKey];
        const IconComponent = config?.icon ?? Church;

        return (
          <section key={page.id} id={slugKey} className="scroll-mt-24">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100" aria-hidden="true">
                <IconComponent className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="!mt-0 !border-0 !pb-0">{page.title}</h2>
            </div>
            <ArticleContent content={page.content} />
          </section>
        );
      })}

      {/* Contact info card */}
      <section id="kontakt-zupe" className="scroll-mt-24">
        <div className="not-prose rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
            <MapPin className="h-5 w-5 text-primary-600" aria-hidden="true" />
            Kontakt župe
          </h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-neutral-500">Adresa</dt>
              <dd className="font-medium text-neutral-900">
                Trg sv. Franje 1, 42231 Veliki Bukovec
              </dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Telefon</dt>
              <dd className="font-medium text-neutral-900">042/769-000</dd>
            </div>
          </dl>
        </div>
      </section>
    </PageLayoutV2>
  );
}

import { pagesRepository } from '@repo/database';
import { buildCanonicalUrl, getPublicEnv, isValidPageSlug, withStaticParams } from '@repo/shared';
import { ArticleContent, FadeIn, PageAccordion, PageSidebar } from '@repo/ui';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

interface StaticPageProps {
  params: Promise<{ slug: string[] }>;
}

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

function getSectionTitle(slug: string): string {
  const sectionMap: Record<string, string> = {
    organizacija: 'Organizacija',
    'rad-uprave': 'Rad uprave',
    opcina: 'Općina',
  };
  const firstPart = slug.split('/')[0] ?? '';
  return sectionMap[firstPart] ?? 'Stranice';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getSlugPath(segments: string[]): string | null {
  const slugPath = segments.join('/');
  return isValidPageSlug(slugPath) ? slugPath : null;
}

// Required for static export - only these params are valid, all others 404
export const dynamicParams = false;
export const dynamic = 'force-static';

// Required for static export - generate all static pages at build time
export const generateStaticParams = withStaticParams(async () => {
  const pages = await pagesRepository.findPublished();
  return pages.map((page) => ({
    slug: page.slug.split('/'),
  }));
}, { routeName: 'static pages' });

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = getSlugPath(slug);

  if (!slugPath) {
    return { title: 'Stranica nije pronađena' };
  }

  const page = await pagesRepository.findBySlug(slugPath);

  if (!page) {
    return { title: 'Stranica nije pronađena' };
  }

  const canonicalUrl = buildCanonicalUrl(NEXT_PUBLIC_SITE_URL, `/${slugPath}`);

  return {
    title: page.title,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { slug } = await params;
  const slugPath = getSlugPath(slug);

  if (!slugPath) {
    notFound();
  }

  const page = await pagesRepository.findBySlug(slugPath);

  if (!page) {
    notFound();
  }

  const siblings = await pagesRepository.findSiblingsBySlug(slugPath);
  const sectionTitle = getSectionTitle(slugPath);

  return (
    <>
      {/* Hero section */}
      <FadeIn>
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold md:text-4xl">{page.title}</h1>
          </div>
        </section>
      </FadeIn>

      {/* Mobile accordion navigation */}
      {siblings.length > 1 && (
        <div className="container mx-auto px-4 pt-6 md:hidden">
          <PageAccordion
            pages={siblings}
            currentSlug={slugPath}
            sectionTitle={sectionTitle}
            currentTitle={page.title}
          />
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-[250px,1fr]">
          {/* Sidebar */}
          {siblings.length > 1 && (
            <FadeIn direction="left" className="hidden md:block">
              <PageSidebar
                pages={siblings}
                currentSlug={slugPath}
                sectionTitle={sectionTitle}
                className="sticky top-8"
              />
            </FadeIn>
          )}

          {/* Content */}
          <div className={siblings.length <= 1 ? 'md:col-span-2' : ''}>
            <FadeIn>
              <ArticleContent content={page.content} />
            </FadeIn>

            {/* Last updated footer */}
            <FadeIn>
              <div className="mt-8 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
                Zadnje ažurirano: {formatDate(page.updatedAt)}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}

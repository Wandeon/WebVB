import { announcementsRepository, type AnnouncementWithAuthor } from '@repo/database';
import {
  ANNOUNCEMENT_CATEGORIES,
  buildCanonicalUrl,
  getPublicEnv,
  stripHtmlTags,
  truncateText,
  withStaticParams,
} from '@repo/shared';
import { ArticleContent, Badge, FadeIn, SectionHeader, ShareButtons } from '@repo/ui';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AttachmentList } from '@/components/announcements';

import { siteConfig } from '../../metadata';

import type { AnnouncementCategory } from '@repo/shared';
import type { Metadata } from 'next';

interface AnnouncementDetailPageProps {
  params: Promise<{ slug: string }>;
}

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

const META_TITLE_MAX_LENGTH = 70;
const META_DESCRIPTION_MAX_LENGTH = 160;

async function fetchAnnouncementBySlug(
  slug: string
): Promise<AnnouncementWithAuthor | null> {
  try {
    return await announcementsRepository.findBySlug(slug);
  } catch {
    throw new Error('Ne možemo trenutno učitati obavijest. Pokušajte ponovno.');
  }
}

async function fetchRelatedAnnouncements(
  announcementId: string,
  category: string,
  limit: number
): Promise<AnnouncementWithAuthor[]> {
  try {
    return await announcementsRepository.getRelatedAnnouncements(
      announcementId,
      category,
      limit
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: AnnouncementDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  let announcement: AnnouncementWithAuthor | null = null;

  try {
    announcement = await fetchAnnouncementBySlug(slug);
  } catch {
    return {
      title: 'Obavijest trenutno nije dostupna',
      description: 'Došlo je do greške prilikom dohvaćanja obavijesti.',
    };
  }

  if (!announcement || !announcement.publishedAt) {
    return { title: 'Obavijest nije pronađena' };
  }

  const titleText = truncateText(
    stripHtmlTags(announcement.title),
    META_TITLE_MAX_LENGTH
  );
  const description =
    announcement.excerpt ||
    truncateText(
      stripHtmlTags(announcement.content ?? ''),
      META_DESCRIPTION_MAX_LENGTH
    );
  const canonicalUrl = buildCanonicalUrl(
    NEXT_PUBLIC_SITE_URL,
    `/obavijesti/${announcement.slug}`
  );

  return {
    title: titleText,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: titleText,
      description,
      type: 'article',
      publishedTime: announcement.publishedAt.toISOString(),
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: titleText,
      description,
    },
  };
}

// Required for static export - only these params are valid, all others 404
export const dynamicParams = false;
export const dynamic = 'force-static';

// Required for static export - generate all announcement pages at build time
export const generateStaticParams = withStaticParams(
  async () => {
    const { announcements } = await announcementsRepository.findPublished({
      limit: 100,
      activeOnly: false,
    });
    return announcements.map((announcement) => ({ slug: announcement.slug }));
  },
  {
    routeName: 'announcement detail pages',
    placeholder: { slug: '__ci_placeholder__' },
  }
);

function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getValidityStatus(
  validFrom: Date | null,
  validUntil: Date | null
): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'secondary';
} | null {
  const now = new Date();

  if (validUntil) {
    if (validUntil < now) {
      return { label: 'Rok istekao', variant: 'danger' };
    }
  }

  if (validFrom) {
    if (validFrom > now) {
      return { label: 'Planirano', variant: 'secondary' };
    }
  }

  if (validUntil) {
    return { label: 'Aktivno', variant: 'success' };
  }

  return null;
}

export default async function AnnouncementDetailPage({
  params,
}: AnnouncementDetailPageProps) {
  const { slug } = await params;
  const announcement = await fetchAnnouncementBySlug(slug);

  if (!announcement || !announcement.publishedAt) {
    notFound();
  }

  const relatedAnnouncements = await fetchRelatedAnnouncements(
    announcement.id,
    announcement.category,
    3
  );

  const categoryLabel =
    ANNOUNCEMENT_CATEGORIES[announcement.category as AnnouncementCategory] ||
    announcement.category;
  const validityStatus = getValidityStatus(
    announcement.validFrom,
    announcement.validUntil
  );

  const articleUrl = `${NEXT_PUBLIC_SITE_URL}/obavijesti/${announcement.slug}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: announcement.title,
    description: announcement.excerpt || announcement.content,
    url: articleUrl,
    datePublished: announcement.publishedAt.toISOString(),
    dateModified: announcement.updatedAt?.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.creator,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.logo,
      },
    },
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Back link */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/obavijesti"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak na obavijesti
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{categoryLabel}</Badge>
            {validityStatus && (
              <Badge variant={validityStatus.variant}>
                {validityStatus.label}
              </Badge>
            )}
          </div>

          <h1 className="mb-4 font-display text-2xl font-bold text-neutral-900 md:text-3xl lg:text-4xl">
            {announcement.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            {announcement.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Objavljeno: {formatDate(announcement.publishedAt)}
              </span>
            )}
            {announcement.validUntil && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Rok: {formatDate(announcement.validUntil)}
              </span>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid gap-8 lg:grid-cols-[1fr,350px]">
          {/* Main content */}
          <div className="space-y-8">
            {announcement.excerpt && (
              <FadeIn>
                <p className="text-lg text-neutral-700">
                  {announcement.excerpt}
                </p>
              </FadeIn>
            )}

            {announcement.content && (
              <FadeIn>
                <ArticleContent content={announcement.content} />
              </FadeIn>
            )}

            {/* Attachments */}
            {announcement.attachments.length > 0 && (
              <FadeIn>
                <AttachmentList attachments={announcement.attachments} />
              </FadeIn>
            )}

            {/* Share */}
            <FadeIn>
              <div className="border-t border-neutral-200 pt-6">
                <ShareButtons url={articleUrl} title={announcement.title} />
              </div>
            </FadeIn>
          </div>

          {/* Sidebar */}
          {relatedAnnouncements.length > 0 && (
            <FadeIn direction="right">
              <div className="lg:sticky lg:top-8">
                <SectionHeader
                  title="Povezane obavijesti"
                  className="mb-4"
                />
                <div className="space-y-4">
                  {relatedAnnouncements.map((related) => (
                    <Link
                      key={related.id}
                      href={`/obavijesti/${related.slug}`}
                      className="block rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
                    >
                      <h3 className="mb-1 line-clamp-2 font-medium text-neutral-900">
                        {related.title}
                      </h3>
                      {related.publishedAt && (
                        <p className="text-sm text-neutral-500">
                          {formatDate(related.publishedAt)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </>
  );
}

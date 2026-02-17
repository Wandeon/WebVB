import {
  announcementsRepository,
  documentsRepository,
  eventsRepository,
  galleriesRepository,
  postsRepository,
  type AnnouncementWithAuthor,
  type DocumentWithUploader,
  type Event,
  type GalleryWithCount,
  type PostWithAuthor,
  type TenderSummary,
} from '@repo/database';
import { createOrganizationJsonLd, createLocalBusinessJsonLd, getPublicEnv } from '@repo/shared';
import {
  AnnouncementCompactCard,
  BentoGrid,
  BentoGridItem,
  DocumentListItem,
  EventCard,
  ExperienceCard,
  FadeIn,
  FeaturedPostCard,
  GalleryShowcase,
  PostCard,
  QuickLinkCard,
  SectionHeader,
} from '@repo/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { shouldSkipDatabase } from '@/lib/build-flags';

import { siteConfig } from './metadata';
import { ExternalServicesSection } from '../components/external-services-section';
import { NewsletterSectionWithApi } from '../components/newsletter-section-with-api';
import { SmartDashboard } from '../components/smart-dashboard';
import { VillageHero } from '../components/village-hero';
import { experienceItems } from '../lib/experience-items';
import { externalServices } from '../lib/external-services';
import { quickLinks } from '../lib/quick-links';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

async function getHomepageData() {
  if (shouldSkipDatabase()) {
    return {
      latestPosts: [] as PostWithAuthor[],
      upcomingEvents: [] as Event[],
      latestAnnouncements: [] as AnnouncementWithAuthor[],
      latestDocuments: [] as DocumentWithUploader[],
      featuredGalleries: [] as GalleryWithCount[],
      nextWasteEvents: [] as Event[],
      tenderSummary: { count: 0, latestTitle: null, items: [] } as TenderSummary,
    };
  }

  const [latestPosts, upcomingEvents, latestAnnouncements, latestDocuments, featuredGalleries, nextWasteEvents, tenderSummary] = await Promise.all([
    postsRepository.getLatestPosts(3),
    eventsRepository.getUpcomingEvents(3),
    announcementsRepository.getLatestActive(4),
    documentsRepository.getLatestDocuments(4),
    galleriesRepository.getFeaturedForHomepage(12),
    eventsRepository.getNextWasteEvents(5),
    announcementsRepository.getActiveTenderSummary(),
  ]);

  return { latestPosts, upcomingEvents, latestAnnouncements, latestDocuments, featuredGalleries, nextWasteEvents, tenderSummary };
}

const WASTE_TYPE_NAMES: Record<string, string> = {
  'miješani komunalni otpad': 'Komunalni',
  'biootpad': 'Biootpad',
  'plastika': 'Plastika',
  'papir i karton': 'Papir i karton',
  'metal': 'Metal',
  'pelene': 'Pelene',
  'staklo': 'Staklo',
};

function extractWasteType(title: string): string {
  const match = title.match(/^Odvoz otpada:\s*(.+)$/i);
  if (!match) return 'Otpad';
  const raw = match[1]!.toLowerCase().trim();
  return WASTE_TYPE_NAMES[raw] ?? raw;
}

function formatWasteDate(eventDate: Date | string): string {
  const date = new Date(eventDate);
  const dayName = date.toLocaleDateString('hr-HR', { weekday: 'short' });
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayName}, ${day}.${month}.`;
}

export default async function HomePage() {
  const { latestPosts, upcomingEvents, latestAnnouncements, latestDocuments, featuredGalleries, nextWasteEvents, tenderSummary } = await getHomepageData();
  const organizationStructuredData = createOrganizationJsonLd({
    name: siteConfig.name,
    url: NEXT_PUBLIC_SITE_URL,
    logo: siteConfig.logo,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.contactPoint.telephone,
      email: siteConfig.contactPoint.email,
      contactType: siteConfig.contactPoint.contactType,
    },
  });

  const localBusinessStructuredData = createLocalBusinessJsonLd({
    name: siteConfig.name,
    url: NEXT_PUBLIC_SITE_URL,
    logo: siteConfig.logo,
    description: 'Službena stranica Općine Veliki Bukovec - lokalna samouprava u Varaždinskoj županiji, Hrvatska.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 46.2833,
      longitude: 16.7667,
    },
    telephone: siteConfig.contactPoint.telephone,
    email: siteConfig.contactPoint.email,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '15:00',
      },
    ],
  });

  const gridAreas = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(organizationStructuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(localBusinessStructuredData)}</script>

      {/* Hero Section */}
      <VillageHero />

      {/* Bento Quick Links with Visual Panel */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-8">
            {/* Left: Smart Municipality Dashboard (hidden on mobile, shown on lg+) */}
            <FadeIn className="hidden lg:block">
              <SmartDashboard
                galleries={featuredGalleries.slice(0, 2).map((g: GalleryWithCount) => ({
                  name: g.name,
                  slug: g.slug,
                  coverImage: g.coverImage,
                  imageCount: g._count.images,
                }))}
              />
            </FadeIn>

            {/* Right: Bento Grid */}
            <div>
              {/* Mobile header (hidden on lg+) */}
              <FadeIn className="mb-6 lg:hidden">
                <SectionHeader
                  title="Brze poveznice"
                  description="Pristupite najčešće korištenim uslugama"
                />
              </FadeIn>

              <BentoGrid>
                {quickLinks.slice(0, 6).map((link, index) => {
                  const area = gridAreas[index] as 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

                  let dynamicContent: React.ReactNode = null;
                  if (area === 'a') {
                    dynamicContent = nextWasteEvents.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/60">Sljedeći odvozi:</p>
                        {nextWasteEvents.map((evt) => (
                          <p key={evt.id} className="text-sm text-white/90">
                            <span className="font-semibold">{extractWasteType(evt.title)}</span>
                            {' — '}
                            {formatWasteDate(evt.eventDate)}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/70">
                        Trenutno nema nadolazećih termina u kalendaru.{' '}
                        <span className="underline">Pogledajte raspored</span>
                      </p>
                    );
                  }

                  if (area === 'f') {
                    dynamicContent = (
                      <span className="inline-flex items-center rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                        Uskoro
                      </span>
                    );
                  }

                  if (area === 'e') {
                    dynamicContent = tenderSummary.items.length > 0 ? (
                      <div className="space-y-1.5 text-xs text-white/80">
                        {tenderSummary.items.map((item, i) => (
                          <div key={i}>
                            <p className="truncate font-medium text-white/90">{item.title}</p>
                            <p className="text-white/60">
                              {item.publishedAt && `Objavljeno: ${new Date(item.publishedAt).toLocaleDateString('hr-HR')}`}
                              {item.validUntil && ` · Rok: ${new Date(item.validUntil).toLocaleDateString('hr-HR')}`}
                            </p>
                          </div>
                        ))}
                        {tenderSummary.count > 2 && (
                          <p className="text-white/60">+ {tenderSummary.count - 2} {tenderSummary.count - 2 === 1 ? 'natječaj' : 'natječaja'} više</p>
                        )}
                      </div>
                    ) : null;
                  }

                  return (
                    <BentoGridItem key={link.href} area={area}>
                      <FadeIn delay={index * 0.05} className="h-full flex-1">
                        <QuickLinkCard
                          title={link.title}
                          description={link.description}
                          href={link.href}
                          icon={link.icon}
                          variant="bento"
                          color={link.color}
                          size={link.size}
                          className="h-full"
                        >
                          {dynamicContent}
                        </QuickLinkCard>
                      </FadeIn>
                    </BentoGridItem>
                  );
                })}
              </BentoGrid>
            </div>
          </div>
        </div>
      </section>

      {/* News Portal Section */}
      <section className="overflow-x-hidden bg-neutral-100 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Vijesti i obavijesti"
              description="Pratite najnovije informacije iz općine"
            />
          </FadeIn>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
            {/* Main News Column */}
            <div className="min-w-0">
              {latestPosts.length > 0 && latestPosts[0] ? (
                <div className="space-y-4">
                  {/* Featured Post */}
                  <FadeIn>
                    <FeaturedPostCard
                      title={latestPosts[0].title}
                      excerpt={latestPosts[0].excerpt}
                      slug={latestPosts[0].slug}
                      category={latestPosts[0].category}
                      featuredImage={latestPosts[0].featuredImage}
                      publishedAt={latestPosts[0].publishedAt}
                    />
                  </FadeIn>

                  {/* Secondary Posts */}
                  {latestPosts.length > 1 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {latestPosts.slice(1, 3).map((post: PostWithAuthor, index: number) => (
                        <FadeIn key={post.id} delay={(index + 1) * 0.05}>
                          <PostCard
                            title={post.title}
                            excerpt={post.excerpt}
                            slug={post.slug}
                            category={post.category}
                            featuredImage={post.featuredImage}
                            publishedAt={post.publishedAt}
                            className="h-full"
                          />
                        </FadeIn>
                      ))}
                    </div>
                  )}

                  {/* View All Link */}
                  <FadeIn delay={0.15}>
                    <Link
                      href="/vijesti"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Sve vijesti
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </FadeIn>
                </div>
              ) : (
                <FadeIn>
                  <div className="rounded-xl bg-white p-8 text-center">
                    <p className="text-neutral-600">
                      Trenutno nema objavljenih vijesti.{' '}
                      <Link href="/vijesti" className="text-primary-600 hover:underline">
                        Pogledajte arhivu
                      </Link>
                    </p>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* Sidebar - Announcements & Documents */}
            <div className="min-w-0 space-y-6">
              {/* Announcements */}
              <FadeIn>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-neutral-900">
                      Obavijesti
                    </h3>
                    <Link
                      href="/obavijesti"
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Sve obavijesti
                    </Link>
                  </div>
                  {latestAnnouncements.length > 0 ? (
                    <div className="space-y-2">
                      {latestAnnouncements.map((announcement: AnnouncementWithAuthor) => (
                        <AnnouncementCompactCard
                          key={announcement.id}
                          title={announcement.title}
                          slug={announcement.slug}
                          category={announcement.category}
                          publishedAt={announcement.publishedAt}
                          attachmentCount={announcement.attachments?.length ?? 0}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-neutral-500">
                      Trenutno nema aktivnih obavijesti.{' '}
                      <Link href="/obavijesti" className="text-primary-600 hover:underline">
                        Pogledajte arhivu
                      </Link>
                      .
                    </p>
                  )}
                </div>
              </FadeIn>

              {/* Latest Documents */}
              <FadeIn delay={0.1}>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-neutral-900">
                      Dokumenti
                    </h3>
                    <Link
                      href="/dokumenti"
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Svi dokumenti
                    </Link>
                  </div>
                  {latestDocuments.length > 0 ? (
                    <div className="-mx-2">
                      {latestDocuments.map((doc: DocumentWithUploader) => (
                        <DocumentListItem
                          key={doc.id}
                          title={doc.title}
                          category={doc.category}
                          fileUrl={doc.fileUrl}
                          fileSize={doc.fileSize}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-neutral-500">
                      Trenutno nema objavljenih dokumenata.{' '}
                      <Link href="/dokumenti" className="text-primary-600 hover:underline">
                        Pogledajte repozitorij
                      </Link>
                      .
                    </p>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Nadolazeća događanja"
              linkText="Kalendar"
              linkHref="/dogadanja"
            />
          </FadeIn>
          {upcomingEvents.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event: Event, index: number) => (
                <FadeIn key={event.id} delay={index * 0.05}>
                  <EventCard
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    eventDate={event.eventDate}
                    eventTime={event.eventTime}
                    endDate={event.endDate}
                    location={event.location}
                    posterImage={event.posterImage}
                  />
                </FadeIn>
              ))}
            </div>
          ) : (
            <FadeIn>
              <p className="mt-6 text-neutral-600">
                Nema nadolazećih događanja.{' '}
                <Link href="/dogadanja" className="text-primary-600 hover:underline">
                  Pogledajte kalendar
                </Link>
              </p>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Doživi Općinu */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Doživi općinu"
              description="Otkrijte ljepote i tradiciju Velikog Bukovca"
            />
          </FadeIn>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experienceItems.map((item, index) => (
              <FadeIn key={item.id} delay={index * 0.1}>
                <ExperienceCard
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  imageAlt={item.imageAlt}
                  href={item.href}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Showcase */}
      {featuredGalleries.length > 0 && (
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <FadeIn>
              <SectionHeader
                title="Galerija"
                description="Pogledajte fotografije iz života naše općine"
                linkText="Sve galerije"
                linkHref="/galerija"
              />
            </FadeIn>
          </div>
          <div className="mt-8">
            <GalleryShowcase
              galleries={featuredGalleries
                .filter((g: GalleryWithCount) => g.coverImage)
                .map((g: GalleryWithCount) => ({
                  name: g.name,
                  slug: g.slug,
                  coverImage: g.coverImage as string,
                  imageCount: g._count.images,
                  eventDate: g.eventDate,
                }))}
            />
          </div>
        </section>
      )}

      {/* External Government Services */}
      <ExternalServicesSection services={externalServices} />

      {/* Newsletter */}
      <NewsletterSectionWithApi />
    </>
  );
}

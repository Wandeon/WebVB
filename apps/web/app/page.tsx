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
  BentoGrid,
  BentoGridItem,
  EventCard,
  ExperienceCard,
  FadeIn,
  GalleryShowcase,
  QuickLinkCard,
  SectionHeader,
} from '@repo/ui';
import { ArrowRight, Baby, ExternalLink, FileText, GlassWater, Leaf, Newspaper, Recycle, Trash2, Wrench } from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { shouldSkipDatabase } from '@/lib/build-flags';

import { siteConfig } from './metadata';
import { ExternalServicesSection } from '../components/external-services-section';
import { NewsletterSectionWithApi } from '../components/newsletter-section-with-api';
import { SmartDashboard } from '../components/smart-dashboard';
import { VillageHero } from '../components/village-hero';
import { experienceItems } from '../lib/experience-items';
import { externalServices } from '../lib/external-services';
import { fetchAllExternalNews, type ExternalNewsItem } from '../lib/external-news';
import { obrti, getTotalCompanies } from '../lib/business-directory';
import { quickLinks } from '../lib/quick-links';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

async function getHomepageData() {
  if (shouldSkipDatabase()) {
    return {
      latestPosts: [] as PostWithAuthor[],
      externalNews: [] as ExternalNewsItem[],
      upcomingEvents: [] as Event[],
      latestAnnouncements: [] as AnnouncementWithAuthor[],
      latestDocuments: [] as DocumentWithUploader[],
      featuredGalleries: [] as GalleryWithCount[],
      nextWasteEvents: [] as Event[],
      tenderSummary: { count: 0, latestTitle: null, items: [] } as TenderSummary,
    };
  }

  const [latestPosts, externalNews, upcomingEvents, latestAnnouncements, latestDocuments, featuredGalleries, nextWasteEvents, tenderSummary] = await Promise.all([
    postsRepository.getLatestPosts(5, false),
    fetchAllExternalNews(),
    eventsRepository.getUpcomingEvents(3),
    announcementsRepository.getLatestActive(5),
    documentsRepository.getLatestDocuments(4),
    galleriesRepository.getFeaturedForHomepage(12),
    eventsRepository.getWeekWasteEvents(),
    announcementsRepository.getActiveTenderSummary(),
  ]);

  return { latestPosts, externalNews, upcomingEvents, latestAnnouncements, latestDocuments, featuredGalleries, nextWasteEvents, tenderSummary };
}

interface WasteTypeInfo {
  name: string;
  color: string;
  icon: LucideIcon;
}

const WASTE_TYPE_MAP: Record<string, WasteTypeInfo> = {
  'miješani komunalni otpad': { name: 'Komunalni', color: 'text-gray-300', icon: Trash2 },
  'biootpad': { name: 'Biootpad', color: 'text-emerald-400', icon: Leaf },
  'plastika': { name: 'Plastika', color: 'text-yellow-400', icon: Recycle },
  'papir i karton': { name: 'Papir i karton', color: 'text-blue-400', icon: Newspaper },
  'metal': { name: 'Metal', color: 'text-slate-300', icon: Wrench },
  'pelene': { name: 'Pelene', color: 'text-pink-400', icon: Baby },
  'staklo': { name: 'Staklo', color: 'text-teal-400', icon: GlassWater },
};

function extractWasteInfo(title: string): WasteTypeInfo {
  const match = title.match(/^Odvoz otpada:\s*(.+)$/i);
  if (!match) return { name: 'Otpad', color: 'text-gray-400', icon: Trash2 };
  const raw = match[1]!.toLowerCase().trim();
  return WASTE_TYPE_MAP[raw] ?? { name: raw, color: 'text-gray-400', icon: Trash2 };
}

function formatWasteDayDate(eventDate: Date | string): string {
  const date = new Date(eventDate);
  const dayName = date.toLocaleDateString('hr-HR', { weekday: 'long' });
  const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${capitalized}, ${dd}.${mm}.${yyyy}`;
}

interface WasteDay {
  dateKey: string;
  dateLabel: string;
  types: WasteTypeInfo[];
}

function groupWasteByDate(events: Array<{ title: string; eventDate: Date | string }>): WasteDay[] {
  const map = new Map<string, WasteDay>();
  for (const evt of events) {
    const d = new Date(evt.eventDate);
    const key = d.toISOString().slice(0, 10);
    if (!map.has(key)) {
      map.set(key, { dateKey: key, dateLabel: formatWasteDayDate(d), types: [] });
    }
    map.get(key)!.types.push(extractWasteInfo(evt.title));
  }
  return Array.from(map.values());
}

export default async function HomePage() {
  const { latestPosts, externalNews, upcomingEvents, latestAnnouncements, latestDocuments, featuredGalleries, nextWasteEvents, tenderSummary } = await getHomepageData();

  // Hero + featured: all from our own site
  const heroPost = latestPosts[0] ?? null;
  const featuredPosts = latestPosts.slice(1, 4);

  // External news grouped by source for 3-column layout
  const externalColumns = [
    { label: 'ŽUPA', fullName: 'Župa sv. Franje Asiškoga', color: 'text-purple-700', accent: 'bg-purple-500', url: 'https://zupa-sv-franje-asiskog.hr', items: externalNews.filter((n) => n.source.shortName === 'Župa').slice(0, 4) },
    { label: 'ŠKOLA', fullName: 'OŠ Veliki Bukovec', color: 'text-emerald-700', accent: 'bg-emerald-500', url: 'http://www.os-veliki-bukovec.skole.hr', items: externalNews.filter((n) => n.source.shortName === 'Škola').slice(0, 4) },
    { label: 'VRTIĆ', fullName: 'DV Krijesnica', color: 'text-amber-700', accent: 'bg-amber-500', url: 'https://www.vrtic-krijesnica.hr', items: externalNews.filter((n) => n.source.shortName === 'Vrtić').slice(0, 4) },
  ].filter((col) => col.items.length > 0);
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
                    const wasteDays = groupWasteByDate(nextWasteEvents);
                    dynamicContent = wasteDays.length > 0 ? (
                      <div className="space-y-4">
                        {wasteDays.map((day) => (
                          <div key={day.dateKey}>
                            <p className="text-sm sm:text-base font-bold text-white">{day.dateLabel}</p>
                            <div className="mt-1.5 space-y-1">
                              {day.types.map((t, i) => {
                                const WasteIcon = t.icon;
                                return (
                                  <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-1.5">
                                    <WasteIcon className={`h-4 w-4 flex-shrink-0 ${t.color}`} />
                                    <span className="text-sm font-medium text-white/90">{t.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/70">
                        Nema odvoza ovaj tjedan.{' '}
                        <span className="underline">Pogledajte raspored</span>
                      </p>
                    );
                  }

                  if (area === 'f') {
                    dynamicContent = (
                      <div className="flex gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-medium text-white/90">
                          <span className="text-sm font-bold">{obrti.length}</span> Obrti
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-medium text-white/90">
                          <span className="text-sm font-bold">{getTotalCompanies()}</span> Poduzeća
                        </span>
                      </div>
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

                  // Wide areas (a=2x2, b/e/f=2x1) use horizontal layout; narrow (c/d=1x1) use vertical
                  const areaLayout = (area === 'c' || area === 'd') ? 'vertical' as const : 'horizontal' as const;

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
                          layout={areaLayout}
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
      <section className="overflow-x-hidden bg-neutral-50 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Vijesti i obavijesti"
              description="Pratite najnovije informacije iz općine i zajednice"
            />
          </FadeIn>

          {/* Top: Hero + Featured (our posts) + Sidebar */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Main: our own posts only */}
            <div className="min-w-0 space-y-6">
              {/* Hero: single primary story */}
              {heroPost && (
                <FadeIn>
                  <Link
                    href={`/vijesti/${heroPost.slug}`}
                    className="group relative block overflow-hidden rounded-2xl bg-neutral-900"
                  >
                    <div className="aspect-[5/2] w-full overflow-hidden">
                      {heroPost.featuredImage ? (
                        <img
                          src={heroPost.featuredImage}
                          alt={heroPost.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary-600 to-primary-800" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      {heroPost.publishedAt && (
                        <span className="text-xs text-white/70">
                          {new Date(heroPost.publishedAt).toLocaleDateString('hr-HR')}
                        </span>
                      )}
                      <h3 className="mt-1 line-clamp-2 text-lg font-bold text-white md:text-xl">
                        {heroPost.title}
                      </h3>
                      {heroPost.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/70">
                          {heroPost.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </FadeIn>
              )}

              {/* Featured: 3 own post cards */}
              {featuredPosts.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {featuredPosts.map((post: PostWithAuthor, i: number) => (
                    <FadeIn key={post.id} delay={i * 0.05}>
                      <Link href={`/vijesti/${post.slug}`} className="group block">
                        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow group-hover:shadow-md">
                          <div className="aspect-[16/9] overflow-hidden">
                            {post.featuredImage ? (
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-primary-500 to-primary-700" />
                            )}
                          </div>
                          <div className="p-3.5">
                            {post.publishedAt && (
                              <span className="text-[10px] text-neutral-400">
                                {new Date(post.publishedAt).toLocaleDateString('hr-HR')}
                              </span>
                            )}
                            <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-primary-600">
                              {post.title}
                            </h4>
                            {post.excerpt && (
                              <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{post.excerpt}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </FadeIn>
                  ))}
                </div>
              )}

              {/* View all link */}
              <FadeIn delay={0.15}>
                <Link
                  href="/vijesti"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Sve vijesti
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </FadeIn>
            </div>

            {/* Right Rail - with color accents */}
            <div className="min-w-0 space-y-6">
              {/* Obavijesti */}
              <FadeIn>
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  <div className="h-1.5 bg-primary-500" />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-900">Obavijesti</h3>
                      <Link
                        href="/obavijesti"
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      >
                        Sve
                      </Link>
                    </div>
                    {latestAnnouncements.length > 0 ? (
                      <div className="mt-3 divide-y divide-neutral-100">
                        {latestAnnouncements.map((a: AnnouncementWithAuthor) => (
                          <Link
                            key={a.id}
                            href={`/obavijesti/${a.slug}`}
                            className="group block py-2.5"
                          >
                            <p className="line-clamp-2 text-sm text-neutral-700 group-hover:text-primary-600">
                              {a.title}
                            </p>
                            {a.publishedAt && (
                              <p className="mt-0.5 text-xs text-neutral-400">
                                {new Date(a.publishedAt).toLocaleDateString('hr-HR')}
                              </p>
                            )}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-400">
                        Nema aktivnih obavijesti.
                      </p>
                    )}
                  </div>
                </div>
              </FadeIn>

              {/* Dokumenti */}
              <FadeIn delay={0.1}>
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  <div className="h-1.5 bg-amber-500" />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-900">Dokumenti</h3>
                      <Link
                        href="/dokumenti"
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      >
                        Svi
                      </Link>
                    </div>
                    {latestDocuments.length > 0 ? (
                      <div className="mt-3 divide-y divide-neutral-100">
                        {latestDocuments.map((doc: DocumentWithUploader) => (
                          <a
                            key={doc.id}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 py-2.5"
                          >
                            <FileText className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                            <p className="min-w-0 flex-1 truncate text-sm text-neutral-700 group-hover:text-primary-600">
                              {doc.title}
                            </p>
                            {doc.fileSize != null && (
                              <span className="flex-shrink-0 text-xs text-neutral-400">
                                {doc.fileSize > 1048576
                                  ? `${(doc.fileSize / 1048576).toFixed(1)} MB`
                                  : `${Math.round(doc.fileSize / 1024)} KB`}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-400">
                        Nema dokumenata.
                      </p>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Bottom: External news - full width, 3 columns by source */}
          {externalColumns.length > 0 && (
            <div className="mt-12">
              <FadeIn>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Najnovije iz zajednice
                </h3>
              </FadeIn>
              <div className="mt-5 grid gap-6 md:grid-cols-3">
                {externalColumns.map((col, colIdx) => (
                  <FadeIn key={col.label} delay={colIdx * 0.05}>
                    <div>
                      {/* Column header with colored accent */}
                      <a
                        href={col.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2.5"
                      >
                        <span className={`h-6 w-1 rounded-full ${col.accent}`} />
                        <div>
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                            {col.label}
                          </h4>
                          <p className="text-xs text-neutral-400 group-hover:text-neutral-600">
                            {col.fullName}
                          </p>
                        </div>
                        <ExternalLink className="ml-auto h-3 w-3 text-neutral-300" />
                      </a>

                      {/* Cards */}
                      <div className="mt-3 space-y-3">
                        {col.items.map((item) => {
                          const d = new Date(item.date);
                          const dateStr = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;
                          return (
                            <a
                              key={item.url}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-lg border border-neutral-100 bg-white p-4 transition-shadow hover:shadow-sm"
                            >
                              <p className="text-xs font-medium text-neutral-400">
                                {dateStr}
                              </p>
                              <h4 className="mt-1.5 line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-primary-600">
                                {item.title}
                              </h4>
                              {item.excerpt && (
                                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                                  {item.excerpt}
                                </p>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}
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

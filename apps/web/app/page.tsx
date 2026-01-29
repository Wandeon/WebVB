import {
  eventsRepository,
  postsRepository,
  type Event,
  type PostWithAuthor,
} from '@repo/database';
import { createOrganizationJsonLd, getPublicEnv } from '@repo/shared';
import {
  BentoGrid,
  BentoGridItem,
  EventCard,
  ExperienceCard,
  FadeIn,
  NewsletterSection,
  PlaceHero,
  PostCard,
  QuickLinkCard,
  SectionHeader,
} from '@repo/ui';
import { BarChart3, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { siteConfig } from './metadata';
import { experienceItems } from '../lib/experience-items';
import { heroConfig } from '../lib/hero-config';
import { quickLinks } from '../lib/quick-links';
import { transparencyConfig } from '../lib/transparency-config';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

async function getHomepageData() {
  const [latestPosts, upcomingEvents] = await Promise.all([
    postsRepository.getLatestPosts(4),
    eventsRepository.getUpcomingEvents(3),
  ]);

  return { latestPosts, upcomingEvents };
}

export default async function HomePage() {
  const { latestPosts, upcomingEvents } = await getHomepageData();
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

  const gridAreas = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(organizationStructuredData)}</script>

      {/* Hero Section */}
      <PlaceHero
        imageSrc={heroConfig.imageSrc}
        videoSrc={heroConfig.videoSrc}
        videoSrcFallback={heroConfig.videoSrcFallback}
        headline={heroConfig.headline}
        subline={heroConfig.subline}
        primaryCta={heroConfig.primaryCta}
        secondaryCta={heroConfig.secondaryCta}
        trustLine={heroConfig.trustLine}
      />

      {/* Bento Quick Links with Visual Panel */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-8">
            {/* Left: Visual Panel (hidden on mobile, shown on lg+) */}
            <FadeIn className="hidden lg:block">
              <div className="relative h-full min-h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800">
                {/* Background image with overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
                  style={{ backgroundImage: 'url(https://pub-920c291ea0c74945936ae9819993768a.r2.dev/migration/2015/02/dvorac-025.webp)' }}
                />
                {/* Decorative circles */}
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
                <div className="absolute right-10 top-1/2 h-40 w-40 rounded-full bg-amber-400/20" />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white">
                  <div>
                    <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                      Općina Veliki Bukovec
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h2 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
                      Brze<br />
                      <span className="text-amber-300">poveznice</span>
                    </h2>
                    <p className="max-w-sm text-lg text-white/80">
                      Pristupite najčešće korištenim uslugama i informacijama brzo i jednostavno.
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                      <div className="flex -space-x-2">
                        <div className="h-10 w-10 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-xs font-bold">24h</div>
                        <div className="h-10 w-10 rounded-full border-2 border-white bg-amber-500 flex items-center justify-center text-xs font-bold">7d</div>
                        <div className="h-10 w-10 rounded-full border-2 border-white bg-rose-500 flex items-center justify-center text-xs font-bold">365</div>
                      </div>
                      <span className="text-sm text-white/70">Dostupno non-stop</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Varaždinska županija, Hrvatska</span>
                  </div>
                </div>
              </div>
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
                {quickLinks.slice(0, 6).map((link, index) => (
                  <BentoGridItem key={link.href} area={gridAreas[index] as 'a' | 'b' | 'c' | 'd' | 'e' | 'f'}>
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
                      />
                    </FadeIn>
                  </BentoGridItem>
                ))}
              </BentoGrid>
            </div>
          </div>
        </div>
      </section>

      {/* News + Events Strip */}
      <section className="overflow-x-hidden bg-neutral-100 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,380px)]">
            {/* News Column */}
            <div>
              <FadeIn>
                <SectionHeader
                  title="Najnovije vijesti"
                  linkText="Sve vijesti"
                  linkHref="/vijesti"
                />
              </FadeIn>
              {latestPosts.length > 0 ? (
                <>
                  {/* Desktop: 2x2 grid */}
                  <div className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2">
                    {latestPosts.map((post: PostWithAuthor, index: number) => (
                      <FadeIn key={post.id} delay={index * 0.05}>
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
                  {/* Mobile: horizontal scroll */}
                  <div className="mt-6 sm:hidden">
                    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
                      {latestPosts.map((post: PostWithAuthor) => (
                        <div
                          key={post.id}
                          className="w-[280px] shrink-0 snap-start"
                        >
                          <PostCard
                            title={post.title}
                            excerpt={post.excerpt}
                            slug={post.slug}
                            category={post.category}
                            featuredImage={post.featuredImage}
                            publishedAt={post.publishedAt}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <FadeIn>
                  <p className="mt-6 text-neutral-600">
                    Trenutno nema objavljenih vijesti.{' '}
                    <Link href="/vijesti" className="text-primary-600 hover:underline">
                      Pogledajte arhivu
                    </Link>
                  </p>
                </FadeIn>
              )}
            </div>

            {/* Events Column */}
            <div>
              <FadeIn>
                <SectionHeader
                  title="Nadolazeća događanja"
                  linkText="Kalendar"
                  linkHref="/dogadanja"
                />
              </FadeIn>
              {upcomingEvents.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {upcomingEvents.map((event: Event, index: number) => (
                    <FadeIn key={event.id} delay={index * 0.05} direction="left">
                      <EventCard
                        id={event.id}
                        title={event.title}
                        description={event.description}
                        eventDate={event.eventDate}
                        eventTime={event.eventTime}
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
          </div>
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

      {/* Transparency */}
      <section className="bg-neutral-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white/70 p-8 text-center backdrop-blur md:p-12">
              <BarChart3 className="mx-auto h-10 w-10 text-primary-600" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-semibold text-neutral-900">
                {transparencyConfig.headline}
              </h2>
              <p className="mt-3 text-neutral-600">
                {transparencyConfig.description}
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <a
                  href={transparencyConfig.mobesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {transparencyConfig.mobesLabel}
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href={transparencyConfig.documentsUrl}
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {transparencyConfig.documentsLabel}
                </Link>
              </div>
              <p className="mt-4 text-sm text-neutral-500">
                {transparencyConfig.helperText}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}

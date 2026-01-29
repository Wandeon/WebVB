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
            {/* Left: Smart Municipality Dashboard (hidden on mobile, shown on lg+) */}
            <FadeIn className="hidden lg:block">
              <div className="relative h-full min-h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

                {/* Decorative elements */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col p-6 text-white">

                  {/* Header */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Pametna Općina
                    </span>
                  </div>

                  {/* Office Status */}
                  <div className="mb-6 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">Jedinstveni upravni odjel</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Otvoreno
                      </span>
                    </div>
                    <div className="text-sm text-white/80">
                      <p>Pon - Pet: 07:00 - 15:00</p>
                      <p className="text-white/50 text-xs mt-1">Trg S. Radića 28, Veliki Bukovec</p>
                    </div>
                  </div>

                  {/* AI Assistant Placeholder */}
                  <div className="flex-1 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Virtualni asistent</h3>
                        <p className="text-xs text-white/50">Powered by AI</p>
                      </div>
                    </div>

                    {/* Chat preview */}
                    <div className="space-y-3 mb-4">
                      <div className="flex gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex-shrink-0 flex items-center justify-center">
                          <span className="text-[10px]">AI</span>
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-white/10 px-3 py-2 text-sm">
                          Pozdrav! Kako vam mogu pomoći danas? 👋
                        </div>
                      </div>
                    </div>

                    {/* Input placeholder */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Postavite pitanje..."
                        disabled
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-white/30 cursor-not-allowed"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">Uskoro</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  <div className="mt-6 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <a href="tel:112" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
                        <span className="text-red-400">●</span> Hitna: 112
                      </a>
                      <a href="tel:042719033" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
                        <span className="text-sky-400">●</span> Općina: 042/719-033
                      </a>
                    </div>
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

import { eventsRepository, postsRepository } from '@repo/database';
import {
  EventCard,
  FadeIn,
  HeroSection,
  NewsletterSignup,
  PostCard,
  QuickLinkCard,
  SectionHeader,
} from '@repo/ui';

import { quickLinks } from '../lib/quick-links';

export const revalidate = 60; // Revalidate every 60 seconds

async function getHomepageData() {
  const [featuredPost, latestPosts, upcomingEvents] = await Promise.all([
    postsRepository.getFeaturedPost(),
    postsRepository.getLatestPosts(4),
    eventsRepository.getUpcomingEvents(4),
  ]);

  return { featuredPost, latestPosts, upcomingEvents };
}

export default async function HomePage() {
  const { featuredPost, latestPosts, upcomingEvents } = await getHomepageData();

  return (
    <>
      {/* Hero Section */}
      <HeroSection post={featuredPost} />

      {/* Quick Links Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Brze poveznice"
              description="Pristupite najčešće korištenim uslugama"
            />
          </FadeIn>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {quickLinks.map((link, index) => (
              <FadeIn key={link.href} delay={index * 0.1}>
                <QuickLinkCard
                  title={link.title}
                  description={link.description}
                  href={link.href}
                  icon={link.icon}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="bg-neutral-100 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="Najnovije vijesti"
              description="Pratite aktualna događanja u općini"
              linkText="Sve vijesti"
              linkHref="/vijesti"
            />
          </FadeIn>
          {latestPosts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestPosts.map((post, index) => (
                <FadeIn key={post.id} delay={index * 0.1}>
                  <PostCard
                    title={post.title}
                    excerpt={post.excerpt}
                    slug={post.slug}
                    category={post.category}
                    featuredImage={post.featuredImage}
                    publishedAt={post.publishedAt}
                  />
                </FadeIn>
              ))}
            </div>
          ) : (
            <FadeIn>
              <p className="text-center text-neutral-600">
                Trenutno nema objavljenih vijesti.
              </p>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Events and Newsletter Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upcoming Events */}
            <div>
              <FadeIn>
                <SectionHeader
                  title="Nadolazeća događanja"
                  linkText="Sva događanja"
                  linkHref="/dogadanja"
                />
              </FadeIn>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <FadeIn key={event.id} delay={index * 0.1} direction="left">
                      <EventCard
                        id={event.id}
                        title={event.title}
                        description={event.description}
                        eventDate={event.eventDate}
                        location={event.location}
                        posterImage={event.posterImage}
                      />
                    </FadeIn>
                  ))}
                </div>
              ) : (
                <FadeIn>
                  <p className="text-neutral-600">
                    Trenutno nema nadolazećih događanja.
                  </p>
                </FadeIn>
              )}
            </div>

            {/* Newsletter Signup */}
            <div>
              <FadeIn direction="right">
                <SectionHeader title="Ostanite informirani" />
                <NewsletterSignup />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

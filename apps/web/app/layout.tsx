import {
  announcementsRepository,
  documentsRepository,
  postsRepository,
} from '@repo/database';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';
import { baseMetadata } from './metadata';
import { CookieConsent } from '../components/cookie-consent';
import { SiteFooter } from '../components/layout/footer';
import { SiteHeader } from '../components/layout/header';
import { PwaRegister } from '../components/pwa';

async function getHeaderData() {
  try {
    const [postsResult, announcementsResult, documentsResult] = await Promise.all([
      postsRepository.findPublished({ limit: 1 }),
      announcementsRepository.findPublished({ limit: 1 }),
      documentsRepository.findAll({ limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }),
    ]);

    return {
      latestPost: postsResult.posts[0]
        ? {
            title: postsResult.posts[0].title,
            slug: postsResult.posts[0].slug,
            category: postsResult.posts[0].category ?? undefined,
            publishedAt: postsResult.posts[0].publishedAt,
          }
        : null,
      latestAnnouncement: announcementsResult.announcements[0]
        ? {
            title: announcementsResult.announcements[0].title,
            slug: announcementsResult.announcements[0].slug,
            publishedAt: announcementsResult.announcements[0].publishedAt,
          }
        : null,
      latestDocument: documentsResult.documents[0]
        ? {
            title: documentsResult.documents[0].title,
            slug: documentsResult.documents[0].id,
            publishedAt: documentsResult.documents[0].createdAt,
          }
        : null,
    };
  } catch {
    return { latestPost: null, latestAnnouncement: null, latestDocument: null };
  }
}

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = baseMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { latestPost, latestAnnouncement, latestDocument } = await getHeaderData();

  return (
    <html lang="hr" className={`${inter.variable} ${plusJakarta.variable}`}>
      <head>
        {/* Performance hints - Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Performance hints - R2 CDN for images */}
        <link rel="preconnect" href="https://pub-920c291ea0c74945936ae9819993768a.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-920c291ea0c74945936ae9819993768a.r2.dev" />
        {/* AI crawler guidance */}
        <link rel="author" href="/llms.txt" type="text/plain" />
      </head>
      <body className="font-sans flex min-h-screen flex-col overflow-x-hidden bg-neutral-50 text-neutral-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          Preskoči na glavni sadržaj
        </a>
        <SiteHeader
          latestPost={latestPost}
          latestAnnouncement={latestAnnouncement}
          latestDocument={latestDocument}
        />
        <main id="main-content" className="flex-1">{children}</main>
        <SiteFooter />
        <CookieConsent />
        <PwaRegister />
      </body>
    </html>
  );
}

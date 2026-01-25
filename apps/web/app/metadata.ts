import { getPublicEnv } from '@repo/shared';

import type { Metadata } from 'next';

const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
const siteUrl = NEXT_PUBLIC_SITE_URL;

export const siteConfig = {
  name: 'Općina Veliki Bukovec',
  description: 'Službena web stranica Općine Veliki Bukovec - vijesti, dokumenti, događanja i informacije za građane.',
  url: siteUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  locale: 'hr_HR',
  creator: 'Općina Veliki Bukovec',
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteConfig.url,
  },
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Veliki Bukovec',
    'općina',
    'Varaždinska županija',
    'lokalna samouprava',
    'vijesti',
    'dokumenti',
    'javna nabava',
  ],
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

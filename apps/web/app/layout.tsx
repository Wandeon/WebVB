import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';
import { SiteHeader } from '../components/layout/header';
import { SiteFooter } from '../components/layout/footer';
import { baseMetadata } from './metadata';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans flex min-h-screen flex-col bg-neutral-50 text-neutral-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          Preskoči na glavni sadržaj
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

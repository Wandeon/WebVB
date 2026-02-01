'use client';

import { APP_NAME } from '@repo/shared';
import { SearchModal, SearchTrigger, useSearchShortcut } from '@repo/ui';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { AccessibilityWidget } from './accessibility-widget';
import { LanguageSwitcher, OfficeStatusBadge, SocialIcons, WeatherBadge } from './header-widgets';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';
import { megaNavGroups } from '../../lib/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface SiteHeaderProps {
  latestPost?: {
    title: string;
    slug: string;
    category?: string | undefined;
    publishedAt?: Date | null | undefined;
  } | null | undefined;
  upcomingEvent?: {
    title: string;
    id: string;
    eventDate: Date;
  } | null | undefined;
}

export function SiteHeader({ latestPost, upcomingEvent }: SiteHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // Enable Cmd+K / Ctrl+K shortcut
  useSearchShortcut(handleOpenSearch);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/85 shadow-sm backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4">
          {/* Left: Mobile menu (mobile) or Logo (desktop) */}
          <div className="flex items-center gap-2 lg:flex-none">
            <MobileMenu
              groups={megaNavGroups}
              logo={
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo.png"
                    alt="Grb Općine Veliki Bukovec"
                    width={32}
                    height={40}
                    className="h-10 w-auto"
                  />
                  <span className="text-lg font-bold text-primary-700">{APP_NAME}</span>
                </div>
              }
            />
            {/* Desktop logo */}
            <Link href="/" className="hidden items-center gap-2 lg:flex">
              <Image
                src="/images/logo.png"
                alt="Grb Općine Veliki Bukovec"
                width={32}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="font-display text-lg font-bold uppercase tracking-tight text-primary-700">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Center: Logo on mobile, Live widgets on desktop */}
          <div className="flex flex-1 items-center justify-center">
            {/* Mobile centered logo */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <Image
                src="/images/logo.png"
                alt="Grb Općine Veliki Bukovec"
                width={32}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="font-display text-base font-bold uppercase tracking-tight text-primary-700">
                Veliki Bukovec
              </span>
            </Link>
            {/* Desktop live widgets */}
            <div className="hidden items-center gap-3 lg:flex">
              <OfficeStatusBadge />
              <WeatherBadge />
            </div>
          </div>

          {/* Right: Search, Kontakt, and Menu */}
          <div className="flex items-center gap-2 lg:gap-3">
            <SocialIcons />
            <LanguageSwitcher />
            <AccessibilityWidget />
            <SearchTrigger onOpen={handleOpenSearch} />

            {/* Kontakt button - visible on desktop */}
            <Link
              href="/kontakt"
              className="hidden items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 lg:flex"
            >
              <Mail className="h-4 w-4" />
              Kontakt
            </Link>

            {/* Desktop Mega Menu */}
            <div className="hidden lg:block">
              <MegaMenu
                groups={megaNavGroups}
                latestPost={latestPost}
                upcomingEvent={upcomingEvent}
              />
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={handleCloseSearch} apiUrl={API_URL} />
    </>
  );
}

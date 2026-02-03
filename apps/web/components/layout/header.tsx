'use client';

import { APP_NAME, getPublicEnv } from '@repo/shared';
import { SearchModal, SearchTrigger, useSearchShortcut } from '@repo/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { AccessibilityWidget } from './accessibility-widget';
import { LanguageSwitcher, SocialIcons } from './header-widgets';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';
import { megaNavGroups } from '../../lib/navigation';

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;

interface SiteHeaderProps {
  latestPost?: {
    title: string;
    slug: string;
    category?: string | undefined;
    publishedAt?: Date | null | undefined;
  } | null | undefined;
  latestAnnouncement?: {
    title: string;
    slug: string;
    publishedAt?: Date | null | undefined;
  } | null | undefined;
  latestDocument?: {
    title: string;
    slug: string;
    publishedAt?: Date | null | undefined;
  } | null | undefined;
}

export function SiteHeader({ latestPost, latestAnnouncement, latestDocument }: SiteHeaderProps) {
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
              <span className="font-display text-sm font-bold uppercase tracking-tight text-primary-700">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Right: Search, Kontakt, and Menu */}
          <div className="flex items-center gap-2 lg:gap-3">
            <SocialIcons />
            <LanguageSwitcher />
            <AccessibilityWidget />
            <SearchTrigger onOpen={handleOpenSearch} />

            {/* Desktop Mega Menu */}
            <div className="hidden lg:block">
              <MegaMenu
                groups={megaNavGroups}
                latestPost={latestPost}
                latestAnnouncement={latestAnnouncement}
                latestDocument={latestDocument}
              />
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={handleCloseSearch} apiUrl={API_URL} />
    </>
  );
}

'use client';

import { APP_NAME } from '@repo/shared';
import {
  MobileDrawer,
  SearchModal,
  SearchTrigger,
  useSearchShortcut,
} from '@repo/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { mainNav, megaNavGroups } from '../../lib/navigation';
import { MegaMenu } from './mega-menu';

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
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <MobileDrawer
              items={mainNav}
              logo={
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo.png"
                    alt="Grb Općine Veliki Bukovec"
                    width={32}
                    height={40}
                    className="h-10 w-auto"
                  />
                  <span className="text-lg font-bold text-primary-700">
                    {APP_NAME}
                  </span>
                </div>
              }
            />
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Grb Općine Veliki Bukovec"
                width={32}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="hidden font-display text-lg font-bold uppercase tracking-tight text-primary-700 md:inline-block">
                {APP_NAME}
              </span>
              <span className="font-display text-lg font-bold uppercase tracking-tight text-primary-700 md:hidden">
                Veliki Bukovec
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <SearchTrigger onOpen={handleOpenSearch} />

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

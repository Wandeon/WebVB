'use client';

import { APP_NAME } from '@repo/shared';
import {
  MobileDrawer,
  NavMenu,
  SearchModal,
  SearchTrigger,
  useSearchShortcut,
} from '@repo/ui';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { mainNav } from '../../lib/navigation';

export function SiteHeader() {
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
                <span className="text-lg font-bold text-primary-700">
                  {APP_NAME}
                </span>
              }
            />
            <Link href="/" className="flex items-center space-x-2">
              <span className="hidden font-display text-lg font-bold uppercase tracking-tight text-primary-700 md:inline-block">
                {APP_NAME}
              </span>
              <span className="font-display text-lg font-bold uppercase tracking-tight text-primary-700 md:hidden">
                Veliki Bukovec
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex">
            <NavMenu items={mainNav} />
          </div>

          <div className="flex items-center gap-4">
            <SearchTrigger onOpen={handleOpenSearch} />
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={handleCloseSearch} />
    </>
  );
}

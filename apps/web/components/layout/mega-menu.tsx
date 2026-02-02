'use client';

import {
  AlertTriangle,
  Bell,
  Building2,
  ChevronDown,
  ExternalLink,
  FileText,
  Home,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { NavGroup } from '../../lib/navigation';

interface MegaMenuProps {
  groups: NavGroup[];
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

const iconMap: Record<string, typeof Building2> = {
  building: Building2,
  newspaper: Newspaper,
  home: Home,
};

export function MegaMenu({ groups, latestPost, latestAnnouncement, latestDocument }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on route change
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      closeMenu();
    }, 0);
  }, [pathname, closeMenu]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeMenu]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    if (href.includes('?')) {
      return pathname === href.split('?')[0];
    }
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="relative flex justify-center">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isOpen ? (
          <>
            Zatvori
            <X className="h-4 w-4" />
          </>
        ) : (
          <>
            Izbornik
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-neutral-900/20 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Mega Menu Panel */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed inset-x-0 top-16 z-50 mx-auto mt-0 w-full max-w-5xl origin-top animate-in fade-in slide-in-from-top-2 duration-200 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-[calc(100vw-2rem)]"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Glass container */}
          <div className="overflow-hidden border-white/20 bg-gradient-to-br from-white/95 via-sky-50/95 to-blue-50/95 shadow-2xl backdrop-blur-xl md:rounded-2xl md:border">
            {/* Main content */}
            <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr_1fr_1.2fr] md:gap-5 md:p-5">
              {/* Navigation columns */}
              {groups.map((group) => {
                const Icon = iconMap[group.icon] || Building2;
                return (
                  <div
                    key={group.title}
                    className="flex flex-col rounded-xl bg-white/60 p-3 shadow-sm backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100">
                        <Icon className="h-3.5 w-3.5 text-primary-600" />
                      </div>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                        {group.title}
                      </h3>
                    </div>
                    <ul className="space-y-0.5" role="menu">
                      {group.items.map((item) => (
                        <li key={item.href} role="none">
                          {item.external ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-neutral-700 transition-all hover:bg-primary-50 hover:text-primary-700 hover:translate-x-1"
                              role="menuitem"
                            >
                              {item.title}
                              <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              className={`group flex items-center rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all hover:translate-x-1 ${
                                isActive(item.href)
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
                              }`}
                              role="menuitem"
                              aria-current={isActive(item.href) ? 'page' : undefined}
                            >
                              {item.title}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Fourth column: Action buttons + Featured content */}
              <div className="flex flex-col gap-2">
                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link
                    href="/kontakt"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-105"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Kontakt
                  </Link>
                  <Link
                    href="/prijava-problema"
                    onClick={closeMenu}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-105"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Prijava problema
                  </Link>
                </div>

                {/* Featured content */}
                <div className="flex-1 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 p-3 text-white shadow-md">
                  <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rose-100">
                    Najnovije
                  </h3>

                  {/* Latest news */}
                  {latestPost && (
                    <Link
                      href={`/vijesti/${latestPost.slug}`}
                      onClick={closeMenu}
                      className="group mb-1.5 flex items-start gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm transition-all hover:bg-white/20"
                    >
                      <Newspaper className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-200" />
                      <p className="line-clamp-1 text-[12px] font-medium leading-tight text-white group-hover:underline">
                        {latestPost.title}
                      </p>
                    </Link>
                  )}

                  {/* Latest announcement */}
                  {latestAnnouncement && (
                    <Link
                      href={`/obavijesti/${latestAnnouncement.slug}`}
                      onClick={closeMenu}
                      className="group mb-1.5 flex items-start gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm transition-all hover:bg-white/20"
                    >
                      <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-200" />
                      <p className="line-clamp-1 text-[12px] font-medium leading-tight text-white group-hover:underline">
                        {latestAnnouncement.title}
                      </p>
                    </Link>
                  )}

                  {/* Latest document */}
                  {latestDocument && (
                    <Link
                      href={`/dokumenti/${latestDocument.slug}`}
                      onClick={closeMenu}
                      className="group flex items-start gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm transition-all hover:bg-white/20"
                    >
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-200" />
                      <p className="line-clamp-1 text-[12px] font-medium leading-tight text-white group-hover:underline">
                        {latestDocument.title}
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Contact strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-primary-100/50 bg-white/50 px-6 py-3 text-xs text-neutral-600">
              <a
                href="tel:042840040"
                className="flex items-center gap-1.5 transition-colors hover:text-primary-600"
              >
                <Phone className="h-3 w-3" />
                042 840 040
              </a>
              <span className="hidden text-neutral-300 sm:inline">•</span>
              <a
                href="https://maps.google.com/?q=Dravska+7+Veliki+Bukovec"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-primary-600"
              >
                <MapPin className="h-3 w-3" />
                Dravska 7, Veliki Bukovec
              </a>
              <span className="hidden text-neutral-300 sm:inline">•</span>
              <a
                href="mailto:opcinavk@gmail.com"
                className="flex items-center gap-1.5 transition-colors hover:text-primary-600"
              >
                <Mail className="h-3 w-3" />
                opcinavk@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

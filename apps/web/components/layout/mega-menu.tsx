'use client';

import {
  Building2,
  CalendarDays,
  ChevronDown,
  ExternalLink,
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
  upcomingEvent?: {
    title: string;
    id: string;
    eventDate: Date;
  } | null | undefined;
}

const iconMap: Record<string, typeof Building2> = {
  building: Building2,
  newspaper: Newspaper,
  home: Home,
};

export function MegaMenu({ groups, latestPost, upcomingEvent }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on route change
  useEffect(() => {
    closeMenu();
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
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
          className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-2rem)] max-w-5xl origin-top-right animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Glass container */}
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/95 via-sky-50/95 to-blue-50/95 shadow-2xl backdrop-blur-xl">
            {/* Main content */}
            <div className="grid gap-6 p-6 md:grid-cols-4">
              {/* Navigation columns */}
              {groups.map((group) => {
                const Icon = iconMap[group.icon] || Building2;
                return (
                  <div
                    key={group.title}
                    className="rounded-xl bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                        <Icon className="h-4 w-4 text-primary-600" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
                        {group.title}
                      </h3>
                    </div>
                    <ul className="space-y-1" role="menu">
                      {group.items.map((item) => (
                        <li key={item.href} role="none">
                          {item.external ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-primary-50 hover:text-primary-700 hover:translate-x-1"
                              role="menuitem"
                            >
                              {item.title}
                              <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:translate-x-1 ${
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

              {/* Featured content column */}
              <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-4 text-white shadow-lg">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-primary-100">
                  Aktualno
                </h3>

                {/* Latest news */}
                {latestPost && (
                  <Link
                    href={`/vijesti/${latestPost.slug}`}
                    onClick={closeMenu}
                    className="group mb-3 block rounded-lg bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Newspaper className="h-3 w-3 text-primary-200" />
                      <span className="text-[10px] font-medium uppercase tracking-wide text-primary-200">
                        Vijest
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight text-white group-hover:underline">
                      {latestPost.title}
                    </p>
                  </Link>
                )}

                {/* Upcoming event */}
                {upcomingEvent && (
                  <Link
                    href={`/dogadanja/${upcomingEvent.id}`}
                    onClick={closeMenu}
                    className="group block rounded-lg bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <CalendarDays className="h-3 w-3 text-primary-200" />
                      <span className="text-[10px] font-medium uppercase tracking-wide text-primary-200">
                        Događaj
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight text-white group-hover:underline">
                      {upcomingEvent.title}
                    </p>
                    <p className="mt-1 text-xs text-primary-200">
                      {upcomingEvent.eventDate.toLocaleDateString('hr-HR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </Link>
                )}

                {/* Fallback if no content */}
                {!latestPost && !upcomingEvent && (
                  <div className="rounded-lg bg-white/10 p-3 text-sm text-primary-100">
                    Pratite najnovije vijesti i događanja u općini.
                  </div>
                )}
              </div>
            </div>

            {/* Contact strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-primary-100/50 bg-white/50 px-6 py-3 text-xs text-neutral-600">
              <a
                href="tel:042719033"
                className="flex items-center gap-1.5 transition-colors hover:text-primary-600"
              >
                <Phone className="h-3 w-3" />
                042/719-033
              </a>
              <span className="hidden text-neutral-300 sm:inline">•</span>
              <a
                href="https://maps.google.com/?q=Trg+S.+Radića+28+Veliki+Bukovec"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-primary-600"
              >
                <MapPin className="h-3 w-3" />
                Trg S. Radića 28, Veliki Bukovec
              </a>
              <span className="hidden text-neutral-300 sm:inline">•</span>
              <a
                href="mailto:opcina@velikibukovec.hr"
                className="flex items-center gap-1.5 transition-colors hover:text-primary-600"
              >
                <Mail className="h-3 w-3" />
                opcina@velikibukovec.hr
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

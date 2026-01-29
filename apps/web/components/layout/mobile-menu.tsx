'use client';

import { Button } from '@repo/ui';
import {
  Building2,
  ExternalLink,
  Home,
  Mail,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { NavGroup } from '../../lib/navigation';

interface MobileMenuProps {
  groups: NavGroup[];
  logo?: React.ReactNode;
}

const iconMap: Record<string, typeof Building2> = {
  building: Building2,
  newspaper: Newspaper,
  home: Home,
};

export function MobileMenu({ groups, logo }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    if (href.includes('?')) {
      return pathname === href.split('?')[0];
    }
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Otvori izbornik"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigacija"
      >
        {/* Header - fixed height */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
          {logo && <div>{logo}</div>}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Zatvori izbornik"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Groups - scrollable, takes remaining space */}
        <div className="flex-1 overflow-y-auto bg-white px-4 py-6">
          <div className="space-y-6">
            {groups.map((group) => {
              const Icon = iconMap[group.icon] || Building2;
              return (
                <div key={group.title}>
                  {/* Group Header */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                      <Icon className="h-4 w-4 text-primary-600" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700">
                      {group.title}
                    </h3>
                  </div>

                  {/* Group Links */}
                  <div className="ml-2 space-y-1 border-l-2 border-primary-100 pl-4">
                    {group.items.map((item) => (
                      <div key={item.href}>
                        {item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-700"
                          >
                            {item.title}
                            <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              isActive(item.href)
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary-700'
                            }`}
                            aria-current={isActive(item.href) ? 'page' : undefined}
                          >
                            {item.title}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Footer - fixed height at bottom */}
        <div className="shrink-0 border-t border-neutral-200 bg-neutral-50 px-4 py-4">
          <div className="space-y-2 text-xs text-neutral-600">
            <a
              href="tel:042719033"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              <Phone className="h-3.5 w-3.5" />
              042/719-033
            </a>
            <a
              href="https://maps.google.com/?q=Trg+S.+Radića+28+Veliki+Bukovec"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              <MapPin className="h-3.5 w-3.5" />
              Trg S. Radića 28, Veliki Bukovec
            </a>
            <a
              href="mailto:opcina@velikibukovec.hr"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              <Mail className="h-3.5 w-3.5" />
              opcina@velikibukovec.hr
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

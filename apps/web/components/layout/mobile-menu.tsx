'use client';

import { Button } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
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
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [isOpen, handleKeyDown]);

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

      {/* Full-Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigacija"
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
              {logo && <div>{logo}</div>}
              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Zatvori izbornik"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation - scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-8">
                {groups.map((group, groupIndex) => {
                  const Icon = iconMap[group.icon] || Building2;
                  return (
                    <motion.div
                      key={group.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.05 }}
                    >
                      {/* Group Header */}
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                          <Icon className="h-5 w-5 text-primary-600" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-primary-700">
                          {group.title}
                        </h3>
                      </div>

                      {/* Group Links */}
                      <div className="grid gap-1">
                        {group.items.map((item) => (
                          <div key={item.href}>
                            {item.external ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-[44px] items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 text-base font-medium text-neutral-700 transition-colors active:bg-neutral-100"
                              >
                                {item.title}
                                <ExternalLink className="h-4 w-4 text-neutral-400" />
                              </a>
                            ) : (
                              <Link
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex min-h-[44px] items-center rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                                  isActive(item.href)
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-neutral-50 text-neutral-700 active:bg-neutral-100'
                                }`}
                                aria-current={isActive(item.href) ? 'page' : undefined}
                              >
                                {item.title}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-neutral-200 bg-neutral-50 px-4 py-4">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-600">
                <a
                  href="tel:042719033"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors active:bg-neutral-200"
                >
                  <Phone className="h-4 w-4" />
                  042/719-033
                </a>
                <a
                  href="mailto:opcina@velikibukovec.hr"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors active:bg-neutral-200"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
                <a
                  href="https://maps.google.com/?q=Trg+S.+Radića+28+Veliki+Bukovec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors active:bg-neutral-200"
                >
                  <MapPin className="h-4 w-4" />
                  Lokacija
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

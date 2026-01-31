'use client';

import { motion } from 'framer-motion';
import { Bell, Calendar, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const contentTypes = [
  { id: 'vijesti', label: 'Vijesti', href: '/vijesti', icon: Newspaper },
  { id: 'obavijesti', label: 'Obavijesti', href: '/obavijesti', icon: Bell },
  { id: 'dogadanja', label: 'Događanja', href: '/dogadanja', icon: Calendar },
] as const;

export function ContentTypeSwitcher() {
  const pathname = usePathname();

  // Determine active tab based on current path
  const activeType = contentTypes.find(
    (type) => pathname === type.href || pathname.startsWith(type.href + '/')
  );

  return (
    <>
      {/* Desktop: Top tabs */}
      <div className="hidden border-b border-neutral-200 bg-white sm:block">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1" aria-label="Vrste sadržaja">
            {contentTypes.map((type) => {
              const isActive = activeType?.id === type.id;
              const Icon = type.icon;

              return (
                <Link
                  key={type.id}
                  href={type.href}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                  {isActive && (
                    <motion.div
                      layoutId="contentTypeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile: Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-md sm:hidden">
        <nav className="flex" aria-label="Vrste sadržaja">
          {contentTypes.map((type) => {
            const isActive = activeType?.id === type.id;
            const Icon = type.icon;

            return (
              <Link
                key={type.id}
                href={type.href}
                className={`relative flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary-700'
                    : 'text-neutral-500'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileContentTypeIndicator"
                    className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-primary-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : ''}`} />
                {type.label}
              </Link>
            );
          })}
        </nav>
        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </div>
    </>
  );
}

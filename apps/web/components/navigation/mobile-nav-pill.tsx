// apps/web/components/navigation/mobile-nav-pill.tsx
'use client';

import { motion } from 'framer-motion';
import { ChevronUp, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { findActiveItem } from '../../lib/navigation';

interface MobileNavPillProps {
  onOpen: () => void;
}

export function MobileNavPill({ onOpen }: MobileNavPillProps) {
  const pathname = usePathname();
  const activeResult = findActiveItem(pathname);

  // Don't show on homepage
  if (pathname === '/') return null;

  const label = activeResult?.item.label || 'Navigacija';

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onOpen}
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition-transform active:scale-95 lg:hidden"
      aria-label={`Navigacija - ${label}`}
    >
      <MapPin className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
      <ChevronUp className="h-4 w-4" aria-hidden="true" />
    </motion.button>
  );
}

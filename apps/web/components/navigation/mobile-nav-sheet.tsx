// apps/web/components/navigation/mobile-nav-sheet.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

import { SidebarNav } from './sidebar-nav';

import type { PageSection } from '../../lib/navigation';


interface MobileNavSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pageSections?: PageSection[];
  activeSectionId?: string | null;
}

export function MobileNavSheet({
  isOpen,
  onClose,
  pageSections = [],
  activeSectionId,
}: MobileNavSheetProps) {
  // Lock body scroll when open
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

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigacija"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl lg:hidden"
          >
            {/* Drag handle */}
            <div className="sticky top-0 z-10 bg-white px-4 pb-2 pt-3">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-300" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-3 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Zatvori navigaciju"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Navigation content */}
            <div className="px-4 pb-8 pt-2">
              <SidebarNav
                pageSections={pageSections}
                activeSectionId={activeSectionId}
                onNavigate={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

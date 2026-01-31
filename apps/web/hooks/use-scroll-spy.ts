// apps/web/hooks/use-scroll-spy.ts
'use client';

import { useEffect, useState } from 'react';

interface UseScrollSpyOptions {
  sectionIds: string[];
  offset?: number;
  throttleMs?: number;
}

export function useScrollSpy({ sectionIds, offset = 100, throttleMs = 100 }: UseScrollSpyOptions) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;

        const scrollPosition = window.scrollY + offset;

        // Find the section that's currently in view
        let currentSection: string | null = null;

        for (const id of sectionIds) {
          const element = document.getElementById(id);
          if (element) {
            const { top } = element.getBoundingClientRect();
            const absoluteTop = top + window.scrollY;

            if (scrollPosition >= absoluteTop) {
              currentSection = id;
            }
          }
        }

        setActiveId(currentSection);
      }, throttleMs);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [sectionIds, offset, throttleMs]);

  return activeId;
}

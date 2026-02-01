'use client';

import { useState } from 'react';

import { MobileNavPill, MobileNavSheet, SidebarNav } from './navigation';
import { SmallHero } from './small-hero';
import { useScrollSpy } from '../hooks/use-scroll-spy';

import type { PageSection } from '../lib/navigation';


interface PageLayoutV2Props {
  title: string;
  subtitle?: string;
  heroImage?: string;
  heroImageAlt?: string;
  sections?: PageSection[];
  children: React.ReactNode;
}

export function PageLayoutV2({
  title,
  subtitle,
  heroImage,
  heroImageAlt,
  sections = [],
  children,
}: PageLayoutV2Props) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Track active section for scroll spy
  const sectionIds = sections.map((s) => s.id);
  const activeSectionId = useScrollSpy({ sectionIds, offset: 120 });

  return (
    <>
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop only */}
          <aside className="hidden w-[280px] flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <SidebarNav
                pageSections={sections}
                activeSectionId={activeSectionId}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Small Hero */}
            <SmallHero
              title={title}
              {...(subtitle !== undefined && { subtitle })}
              {...(heroImage !== undefined && { image: heroImage })}
              {...(heroImageAlt !== undefined && { imageAlt: heroImageAlt })}
            />

            {/* Content */}
            <article className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:mt-10 prose-h2:scroll-mt-24 prose-h2:text-xl prose-h2:border-b prose-h2:border-neutral-200 prose-h2:pb-3 prose-h3:mt-6 prose-h3:scroll-mt-24 prose-p:text-neutral-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-li:text-neutral-600">
              {children}
            </article>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavPill onOpen={() => setIsSheetOpen(true)} />
      <MobileNavSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        pageSections={sections}
        activeSectionId={activeSectionId}
      />
    </>
  );
}

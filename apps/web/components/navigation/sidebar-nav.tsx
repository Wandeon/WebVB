// apps/web/components/navigation/sidebar-nav.tsx
'use client';

import { usePathname } from 'next/navigation';

import { SidebarItem } from './sidebar-item';
import { findActiveItem, findSectionForPath } from '../../lib/navigation';

import type { PageSection } from '../../lib/navigation';


interface SidebarNavProps {
  pageSections?: PageSection[];
  activeSectionId?: string | null | undefined;
  onNavigate?: (() => void) | undefined;
}

export function SidebarNav({
  pageSections = [],
  activeSectionId,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();

  // Find which section and item are active
  const activeSection = findSectionForPath(pathname);
  const activeResult = findActiveItem(pathname);

  if (!activeSection) {
    return null;
  }

  return (
    <nav className="space-y-1" aria-label="Stranica navigacija">
      {/* Section header */}
      <div className="mb-3 px-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {activeSection.title}
        </h2>
      </div>

      {/* Section items */}
      {activeSection.items.map((item) => {
        const isActive = activeResult?.item.id === item.id && !activeResult?.parent;
        const isParentOfActive = activeResult?.parent?.id === item.id;
        const activeChildId = activeResult?.parent ? activeResult.item.id : undefined;

        return (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={isActive}
            isParentOfActive={isParentOfActive}
            activeChildId={activeChildId}
            pageSections={isActive ? pageSections : []}
            activeSectionId={activeSectionId ?? null}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}

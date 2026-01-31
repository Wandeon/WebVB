// apps/web/components/navigation/sidebar-item.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import type { NavItem, PageSection } from '../../lib/navigation';

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isParentOfActive: boolean;
  activeChildId?: string | undefined;
  pageSections?: PageSection[];
  activeSectionId?: string | null | undefined;
  depth?: number;
  onNavigate?: (() => void) | undefined;
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export function SidebarItem({
  item,
  isActive,
  isParentOfActive,
  activeChildId,
  pageSections = [],
  activeSectionId,
  depth = 0,
  onNavigate,
}: SidebarItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const hasSections = pageSections.length > 0;
  const isExpanded = isActive || isParentOfActive;

  const paddingLeft = depth === 0 ? 'pl-3' : depth === 1 ? 'pl-6' : 'pl-9';

  const linkProps = {
    ...(onNavigate && { onClick: () => onNavigate() }),
    ...(item.external && { target: '_blank' as const, rel: 'noopener noreferrer' }),
  };

  return (
    <div className="relative">
      {/* Main item link */}
      <Link
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        {...linkProps}
        className={`
          group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
          ${paddingLeft}
          ${isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute left-0 h-6 w-1 rounded-r-full bg-primary-600"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}

        <span className="flex-1">{item.label}</span>

        {item.external && (
          <ExternalLink
            className="h-3 w-3 text-neutral-400"
            aria-label="Otvara se u novom prozoru"
          />
        )}

        {(hasChildren || (isActive && hasSections)) && (
          <ChevronRight
            className={`h-4 w-4 text-neutral-400 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            aria-hidden="true"
          />
        )}
      </Link>

      {/* Expanded children or sections */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
            className="overflow-hidden"
          >
            {/* Page sections (when this item is active) */}
            {isActive && hasSections && (
              <div className="ml-4 mt-1 border-l-2 border-primary-200 pl-2">
                {pageSections.map((section) => (
                  <motion.a
                    key={section.id}
                    href={`#${section.id}`}
                    variants={itemVariants}
                    onClick={onNavigate ? () => onNavigate() : undefined}
                    className={`
                      block rounded px-3 py-1.5 text-sm transition-colors
                      ${activeSectionId === section.id
                        ? 'bg-primary-50 font-medium text-primary-700'
                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
                      }
                    `}
                  >
                    {section.label}
                  </motion.a>
                ))}
              </div>
            )}

            {/* Child pages (for items like Naselja) */}
            {hasChildren && (isParentOfActive || isActive) && (
              <div className="mt-1">
                {item.children!.map((child) => (
                  <motion.div key={child.id} variants={itemVariants}>
                    <SidebarItem
                      item={child}
                      isActive={activeChildId === child.id}
                      isParentOfActive={false}
                      pageSections={activeChildId === child.id ? pageSections : []}
                      activeSectionId={activeSectionId ?? null}
                      depth={depth + 1}
                      onNavigate={onNavigate}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

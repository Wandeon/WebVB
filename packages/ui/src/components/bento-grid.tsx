import { cn } from '../lib/utils';

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A beautiful bento-style grid layout with explicit positioning
 *
 * Mobile layout (2 columns):
 * ┌──────────┬──────────┐
 * │    a     │    a     │  (full width)
 * ├──────────┼──────────┤
 * │    b     │    b     │  (full width)
 * ├──────────┼──────────┤
 * │    c     │    d     │  (half each)
 * ├──────────┼──────────┤
 * │    e     │    f     │  (half each)
 * └──────────┴──────────┘
 *
 * Desktop layout (4 columns):
 * ┌──────────┬──────────┬──────────┬──────────┐
 * │    a     │    a     │    b     │    b     │
 * ├──────────┼──────────┼──────────┼──────────┤
 * │    a     │    a     │    c     │    d     │
 * ├──────────┼──────────┼──────────┼──────────┤
 * │    e     │    e     │    f     │    f     │
 * └──────────┴──────────┴──────────┴──────────┘
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid gap-3 sm:gap-4',
        // Mobile: 2 columns with explicit areas
        'grid-cols-2',
        '[grid-template-areas:"a_a""b_b""c_d""e_f"]',
        'grid-rows-[minmax(140px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)]',
        // Desktop: 4 columns with different layout
        'lg:grid-cols-4',
        'lg:[grid-template-areas:"a_a_b_b""a_a_c_d""e_e_f_f"]',
        'lg:grid-rows-[minmax(160px,auto)_minmax(160px,auto)_minmax(140px,auto)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface BentoGridItemProps {
  children: React.ReactNode;
  /**
   * Grid area for positioning:
   * - 'a': Large featured - 2x1 mobile, 2x2 desktop
   * - 'b': Wide - 2x1 on both
   * - 'c': Small - 1x1 on both
   * - 'd': Small - 1x1 on both
   * - 'e': Half on mobile, wide on desktop
   * - 'f': Half on mobile, wide on desktop
   */
  area?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  className?: string;
}

// Static mapping for grid areas (Tailwind JIT compatible)
const areaClasses: Record<string, string> = {
  a: '[grid-area:a]',
  b: '[grid-area:b]',
  c: '[grid-area:c]',
  d: '[grid-area:d]',
  e: '[grid-area:e]',
  f: '[grid-area:f]',
};

export function BentoGridItem({ children, area, className }: BentoGridItemProps) {
  return (
    <div className={cn(area && areaClasses[area], 'flex flex-col', className)}>
      {children}
    </div>
  );
}

import { cn } from '../lib/utils';

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A beautiful bento-style grid layout with explicit positioning
 *
 * Desktop layout (6 items):
 * ┌──────────┬──────────┬──────────┬──────────┐
 * │    a     │    a     │    b     │    b     │
 * │  (2x2)   │  (2x2)   │  (2x1)   │  (2x1)   │
 * ├──────────┼──────────┼──────────┼──────────┤
 * │    a     │    a     │    c     │    d     │
 * │  (2x2)   │  (2x2)   │  (1x1)   │  (1x1)   │
 * ├──────────┼──────────┼──────────┼──────────┤
 * │    e     │    e     │    f     │    f     │
 * │  (2x1)   │  (2x1)   │  (2x1)   │  (2x1)   │
 * └──────────┴──────────┴──────────┴──────────┘
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        // Mobile: single column
        'grid-cols-1',
        // Tablet: 2 columns
        'sm:grid-cols-2',
        // Desktop: 4 columns with explicit grid areas
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
   * - 'a': Large featured (2x2) - top left
   * - 'b': Wide (2x1) - top right
   * - 'c': Small (1x1) - middle right-left
   * - 'd': Small (1x1) - middle right-right
   * - 'e': Wide (2x1) - bottom left
   * - 'f': Wide (2x1) - bottom right
   */
  area?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  className?: string;
}

// Static mapping for grid areas (Tailwind JIT compatible)
const areaClasses: Record<string, string> = {
  a: 'lg:[grid-area:a]',
  b: 'lg:[grid-area:b]',
  c: 'lg:[grid-area:c]',
  d: 'lg:[grid-area:d]',
  e: 'lg:[grid-area:e]',
  f: 'lg:[grid-area:f]',
};

export function BentoGridItem({ children, area, className }: BentoGridItemProps) {
  return (
    <div className={cn(area && areaClasses[area], 'min-h-[140px]', className)}>
      {children}
    </div>
  );
}

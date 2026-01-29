import { cn } from '../lib/utils';

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A beautiful bento-style grid layout
 * Desktop: 4 columns with visual hierarchy
 * Mobile: Clean stacked layout with featured items spanning full width
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        // Mobile: 2 columns
        'grid-cols-2',
        // Tablet: proper 4-column bento
        'md:grid-cols-4 md:auto-rows-[180px]',
        // Desktop: taller rows
        'lg:auto-rows-[200px]',
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
   * - 'a': Large featured (2x2)
   * - 'b': Medium wide (2x1)
   * - 'c', 'd': Small (1x1)
   * - 'e': Medium wide (2x1)
   * - 'f': Small (1x1) - optional 6th item
   */
  area?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  className?: string;
}

export function BentoGridItem({ children, area, className }: BentoGridItemProps) {
  // Map areas to responsive span classes
  const areaStyles: Record<string, string> = {
    // Large featured - 2 cols on mobile, 2x2 on desktop
    a: 'col-span-2 md:col-span-2 md:row-span-2',
    // Medium wide - full on mobile, 2x1 on desktop
    b: 'col-span-2 md:col-span-2 md:row-span-1',
    // Small - 1 col on mobile, 1x1 on desktop
    c: 'col-span-1 md:col-span-1 md:row-span-1',
    // Small - 1 col on mobile, 1x1 on desktop
    d: 'col-span-1 md:col-span-1 md:row-span-1',
    // Medium wide - full on mobile, 2x1 on desktop
    e: 'col-span-2 md:col-span-2 md:row-span-1',
    // Small - full on mobile (last item), 2x1 on desktop
    f: 'col-span-2 md:col-span-2 md:row-span-1',
  };

  return (
    <div className={cn(area && areaStyles[area], className)}>
      {children}
    </div>
  );
}

import { cn } from '../lib/utils';

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        // Mobile: stack all, last two side by side
        'grid-cols-2',
        // Desktop: bento layout
        'lg:grid-cols-[1fr_1fr_minmax(200px,0.6fr)]',
        'lg:[grid-template-areas:"a_b_e""c_d_f"]',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface BentoGridItemProps {
  children: React.ReactNode;
  area?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  className?: string;
}

// Static mapping of area to lg: grid-area classes (required for Tailwind JIT)
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
    <div
      className={cn(
        // Mobile: first 4 items span full width, last 2 are half
        // These only apply before lg: breakpoint (when grid-template-areas is not set)
        '[&:nth-child(-n+4)]:col-span-2 lg:[&:nth-child(-n+4)]:col-span-1',
        '[&:nth-child(n+5)]:col-span-1',
        // Desktop: use grid-area for placement
        area && areaClasses[area],
        className
      )}
    >
      {children}
    </div>
  );
}

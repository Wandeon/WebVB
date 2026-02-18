import type { QuickLinkColorVariant, QuickLinkIconName } from '@repo/ui';

export interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: QuickLinkIconName;
  color: QuickLinkColorVariant;
  size: 'large' | 'small';
}

/**
 * Quick links for the homepage bento grid
 *
 * Color scheme inspired by Veliki Bukovec crest:
 * - Sky blue (crest background)
 * - Golden amber (flower center)
 * - Emerald green (nature)
 * - Rose (warmth/community)
 * - Slate (formal/documents)
 *
 * Desktop layout (4-column grid with explicit areas):
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
export const quickLinks: QuickLink[] = [
  {
    // Area 'a' - Large featured (2x2)
    title: 'Odvoz otpada',
    description: 'Provjerite sljedeći termin',
    href: '/odvoz-otpada',
    icon: 'trash2',
    color: 'green',
    size: 'large',
  },
  {
    // Area 'b' - Wide (2x1)
    title: 'Prijava problema',
    description: 'Prijavite komunalne probleme',
    href: '/prijava-problema',
    icon: 'alertTriangle',
    color: 'sky',
    size: 'small',
  },
  {
    // Area 'c' - Small (1x1)
    title: 'Dokumenti',
    description: 'Službeni dokumenti i obrasci',
    href: '/dokumenti',
    icon: 'fileSearch',
    color: 'slate',
    size: 'small',
  },
  {
    // Area 'd' - Small (1x1)
    title: 'Događanja',
    description: 'Kalendar događanja',
    href: '/dogadanja',
    icon: 'calendarDays',
    color: 'rose',
    size: 'small',
  },
  {
    // Area 'e' - Wide (2x1)
    title: 'Natječaji',
    description: 'Aktivni natječaji i javni pozivi',
    href: '/obavijesti?category=natjecaj',
    icon: 'fileText',
    color: 'gold',
    size: 'small',
  },
  {
    // Area 'f' - Wide (2x1)
    title: 'Poduzetništvo',
    description: 'Obrti i tvrtke na području općine',
    href: '/poduzetnistvo',
    icon: 'store',
    color: 'sky',
    size: 'small',
  },
];

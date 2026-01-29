import type { QuickLinkIconName } from '@repo/ui';

export interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: QuickLinkIconName;
  size: 'large' | 'small';
}

/**
 * Quick links for the homepage bento grid
 *
 * Layout on desktop (4-column grid):
 * ┌─────────────┬─────────────┬─────────────┬─────────────┐
 * │             │             │     c       │      d      │
 * │     a       │      b      ├─────────────┴─────────────┤
 * │  (2x2)      │   (2x1)     │            e              │
 * ├─────────────┴─────────────┼───────────────────────────┤
 * │            f              │                           │
 * └───────────────────────────┴───────────────────────────┘
 *
 * - 'a' = Large featured card (2 cols x 2 rows) - Prijava problema
 * - 'b' = Wide card (2 cols x 1 row) - Odvoz otpada
 * - 'c', 'd' = Small cards (1 col x 1 row) - Dokumenti, Događanja
 * - 'e', 'f' = Wide cards (2 cols x 1 row) - Natječaji, Udruge
 */
export const quickLinks: QuickLink[] = [
  {
    title: 'Prijava problema',
    description: 'Prijavite komunalne probleme brzo i jednostavno. Pratite status vaše prijave u realnom vremenu.',
    href: '/prijava-problema',
    icon: 'alertTriangle',
    size: 'large',
  },
  {
    title: 'Odvoz otpada',
    description: 'Raspored odvoza i upute za razvrstavanje',
    href: '/odvoz-otpada',
    icon: 'trash2',
    size: 'large',
  },
  {
    title: 'Dokumenti',
    description: 'Službeni dokumenti i obrasci',
    href: '/dokumenti',
    icon: 'fileSearch',
    size: 'small',
  },
  {
    title: 'Događanja',
    description: 'Kalendar događanja',
    href: '/dogadanja',
    icon: 'calendarDays',
    size: 'small',
  },
  {
    title: 'Natječaji',
    description: 'Aktivni natječaji i javni pozivi',
    href: '/natjecaji',
    icon: 'fileText',
    size: 'small',
  },
  {
    title: 'Financiranje udruga',
    description: 'Podrška udrugama civilnog društva',
    href: '/rad-uprave/udruge',
    icon: 'users',
    size: 'small',
  },
];

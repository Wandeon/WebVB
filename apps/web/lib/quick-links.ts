import {
  AlertTriangle,
  CalendarDays,
  FileSearch,
  FileText,
  Trash2,
  Users,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  size: 'large' | 'small';
}

// Ordered by priority for bento grid layout
export const quickLinks: QuickLink[] = [
  {
    title: 'Prijava problema',
    description: 'Prijavite komunalni problem',
    href: '/prijava-problema',
    icon: AlertTriangle,
    size: 'large',
  },
  {
    title: 'Odvoz otpada',
    description: 'Raspored odvoza otpada',
    href: '/odvoz-otpada',
    icon: Trash2,
    size: 'large',
  },
  {
    title: 'Dokumenti',
    description: 'Službeni dokumenti i obrasci',
    href: '/dokumenti',
    icon: FileSearch,
    size: 'large',
  },
  {
    title: 'Događanja',
    description: 'Kalendar događanja',
    href: '/dogadanja',
    icon: CalendarDays,
    size: 'large',
  },
  {
    title: 'Natječaji',
    description: 'Aktivni natječaji',
    href: '/natjecaji',
    icon: FileText,
    size: 'small',
  },
  {
    title: 'Udruge',
    description: 'Udruge u općini',
    href: '/rad-uprave/udruge',
    icon: Users,
    size: 'small',
  },
];

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
}

export const quickLinks: QuickLink[] = [
  {
    title: 'Natječaji',
    description: 'Aktivni natječaji i javni pozivi',
    href: '/natjecaji',
    icon: FileText,
  },
  {
    title: 'Prijava problema',
    description: 'Prijavite komunalni problem',
    href: '/prijava-problema',
    icon: AlertTriangle,
  },
  {
    title: 'Odvoz otpada',
    description: 'Raspored odvoza otpada',
    href: '/odvoz-otpada',
    icon: Trash2,
  },
  {
    title: 'Dokumenti',
    description: 'Službeni dokumenti i obrasci',
    href: '/dokumenti',
    icon: FileSearch,
  },
  {
    title: 'Događanja',
    description: 'Kalendar događanja',
    href: '/dogadanja',
    icon: CalendarDays,
  },
  {
    title: 'Udruge',
    description: 'Udruge u općini',
    href: '/rad-uprave/udruge',
    icon: Users,
  },
];

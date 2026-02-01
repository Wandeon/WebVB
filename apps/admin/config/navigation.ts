import {
  Bell,
  BellRing,
  Brain,
  CalendarDays,
  FileText,
  Image,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';

import type { ComponentType, SVGProps } from 'react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export interface NavItem {
  title: string;
  href: string;
  icon: IconComponent;
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// Helper to cast icons to our compatible type
const icon = <T extends IconComponent>(Icon: T): IconComponent => Icon;

export const adminNavigation: NavSection[] = [
  {
    items: [
      {
        title: 'Nadzorna ploča',
        href: '/',
        icon: icon(LayoutDashboard),
      },
    ],
  },
  {
    title: 'Sadržaj',
    items: [
      {
        title: 'Objave',
        href: '/posts',
        icon: icon(FileText),
      },
      {
        title: 'Obavijesti',
        href: '/announcements',
        icon: icon(Bell),
      },
      {
        title: 'Stranice',
        href: '/pages',
        icon: icon(FileText),
      },
      {
        title: 'Dokumenti',
        href: '/documents',
        icon: icon(FileText),
      },
      {
        title: 'Događanja',
        href: '/events',
        icon: icon(CalendarDays),
      },
      {
        title: 'Galerija',
        href: '/galleries',
        icon: icon(Image),
      },
    ],
  },
  {
    title: 'Komunikacija',
    items: [
      {
        title: 'Poruke',
        href: '/messages',
        icon: icon(Inbox),
      },
      {
        title: 'Prijave problema',
        href: '/reports',
        icon: icon(MessageSquare),
      },
      {
        title: 'Newsletter',
        href: '/newsletter',
        icon: icon(Mail),
      },
      {
        title: 'Push obavijesti',
        href: '/notifications',
        icon: icon(BellRing),
      },
    ],
  },
  {
    title: 'AI',
    items: [
      {
        title: 'AI Sustav',
        href: '/ai',
        icon: icon(Brain),
      },
    ],
  },
  {
    title: 'Administracija',
    items: [
      {
        title: 'Korisnici',
        href: '/users',
        icon: icon(Users),
      },
      {
        title: 'Postavke',
        href: '/settings',
        icon: icon(Settings),
      },
    ],
  },
];

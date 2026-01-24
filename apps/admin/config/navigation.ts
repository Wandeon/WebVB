import {
  CalendarDays,
  FileText,
  Home,
  Image,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const adminNavigation: NavSection[] = [
  {
    items: [
      {
        title: 'Nadzorna ploča',
        href: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Sadržaj',
    items: [
      {
        title: 'Objave',
        href: '/posts',
        icon: FileText,
      },
      {
        title: 'Dokumenti',
        href: '/documents',
        icon: FileText,
      },
      {
        title: 'Događanja',
        href: '/events',
        icon: CalendarDays,
      },
      {
        title: 'Galerija',
        href: '/galleries',
        icon: Image,
      },
      {
        title: 'Stranice',
        href: '/pages',
        icon: Home,
      },
    ],
  },
  {
    title: 'Komunikacija',
    items: [
      {
        title: 'Poruke',
        href: '/messages',
        icon: Inbox,
      },
      {
        title: 'Prijave problema',
        href: '/reports',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Administracija',
    items: [
      {
        title: 'Korisnici',
        href: '/users',
        icon: Users,
      },
      {
        title: 'Postavke',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];

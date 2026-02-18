// apps/web/lib/navigation.ts

export interface PageSection {
  id: string;
  label: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  sections?: PageSection[];
  external?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  icon: string;
  items: NavItem[];
}

// Sidebar navigation sections (3 groups matching mega menu)
export const sidebarSections: NavSection[] = [
  {
    id: 'nas-kraj',
    title: 'Naš Kraj',
    icon: 'map-pin',
    items: [
      { id: 'opcina', label: 'Općina', href: '/opcina' },
      {
        id: 'naselja',
        label: 'Naselja',
        href: '/naselja',
        children: [
          { id: 'veliki-bukovec', label: 'Veliki Bukovec', href: '/naselja/veliki-bukovec' },
          { id: 'dubovica', label: 'Dubovica', href: '/naselja/dubovica' },
          { id: 'kapela', label: 'Kapela Podravska', href: '/naselja/kapela' },
        ],
      },
      { id: 'zupa', label: 'Župa', href: '/zupa' },
      { id: 'skola', label: 'Škola', href: '/skola' },
      { id: 'udruge', label: 'Udruge', href: '/udruge' },
      { id: 'poduzetnistvo', label: 'Poduzetništvo', href: '/poduzetnistvo' },
    ],
  },
  {
    id: 'uprava',
    title: 'Uprava',
    icon: 'building',
    items: [
      { id: 'nacelnik', label: 'Načelnik', href: '/nacelnik' },
      { id: 'vijece', label: 'Vijeće', href: '/vijece' },
      { id: 'usluge', label: 'Usluge', href: '/usluge' },
      { id: 'dokumenti', label: 'Dokumenti', href: '/dokumenti' },
      { id: 'javna-nabava', label: 'Javna nabava', href: '/javna-nabava' },
    ],
  },
  {
    id: 'aktualno',
    title: 'Aktualno',
    icon: 'newspaper',
    items: [
      { id: 'vijesti', label: 'Vijesti', href: '/vijesti' },
      { id: 'obavijesti', label: 'Obavijesti', href: '/obavijesti' },
      { id: 'galerija', label: 'Galerija', href: '/galerija' },
      { id: 'dogadanja', label: 'Događanja', href: '/dogadanja' },
      { id: 'izbori', label: 'Izbori', href: '/izbori' },
    ],
  },
];

// Helper to find which section a path belongs to
export function findSectionForPath(path: string): NavSection | null {
  for (const section of sidebarSections) {
    for (const item of section.items) {
      if (path === item.href || path.startsWith(item.href + '/')) {
        return section;
      }
      if (item.children) {
        for (const child of item.children) {
          if (path === child.href || path.startsWith(child.href + '/')) {
            return section;
          }
        }
      }
    }
  }
  return null;
}

// Helper to find active item and its parent
export function findActiveItem(path: string): { item: NavItem; parent?: NavItem } | null {
  for (const section of sidebarSections) {
    for (const item of section.items) {
      if (path === item.href) {
        return { item };
      }
      if (item.children) {
        for (const child of item.children) {
          if (path === child.href) {
            return { item: child, parent: item };
          }
        }
      }
    }
  }
  return null;
}

// Legacy types for backward compatibility during migration
export type NavGroup = {
  title: string;
  icon: string;
  items: { title: string; href: string; external?: boolean }[];
};

// Legacy exports for backward compatibility during migration
export const megaNavGroups: NavGroup[] = sidebarSections.map((section) => ({
  title: section.title,
  icon: section.icon,
  items: section.items.map((item) => {
    const navItem: { title: string; href: string; external?: boolean } = {
      title: item.label,
      href: item.href,
    };
    if (item.external) {
      navItem.external = item.external;
    }
    return navItem;
  }),
}));

export const mainNav = [
  { title: 'Naslovnica', href: '/' },
  ...sidebarSections.flatMap((s) =>
    s.items.map((item) => ({
      title: item.label,
      href: item.href,
    }))
  ),
];

export const footerLinks = [
  {
    title: 'Brze poveznice',
    items: [
      { title: 'Vijesti', href: '/vijesti' },
      { title: 'Obavijesti', href: '/obavijesti' },
      { title: 'Dokumenti', href: '/dokumenti' },
      { title: 'Usluge', href: '/usluge' },
      { title: 'Korisni kontakti', href: '/korisni-kontakti' },
      { title: 'Prijava problema', href: '/prijava-problema' },
    ],
  },
  {
    title: 'Kontakt',
    items: [
      { title: 'Općina Veliki Bukovec', href: '/kontakt' },
      { title: 'Dravska 7, Veliki Bukovec', href: 'https://maps.google.com/?q=Dravska+7+Veliki+Bukovec' },
      { title: '42231 Mali Bukovec', href: '/kontakt' },
      { title: 'opcinavk@gmail.com', href: 'mailto:opcinavk@gmail.com' },
    ],
  },
];

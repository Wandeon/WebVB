export type NavItem = {
  title: string;
  href: string;
  external?: boolean;
  items?: { title: string; href: string; external?: boolean }[];
};

export type NavGroup = {
  title: string;
  icon: string;
  items: { title: string; href: string; external?: boolean }[];
};

// Grouped navigation for mega menu
export const megaNavGroups: NavGroup[] = [
  {
    title: 'Uprava',
    icon: 'building',
    items: [
      { title: 'Organizacija', href: '/organizacija' },
      { title: 'Usluge', href: '/usluge' },
      { title: 'Dokumenti', href: '/dokumenti' },
      { title: 'Javna nabava', href: 'https://eojn.nn.hr/', external: true },
    ],
  },
  {
    title: 'Informacije',
    icon: 'newspaper',
    items: [
      { title: 'Vijesti', href: '/vijesti' },
      { title: 'Obavijesti', href: '/obavijesti' },
      { title: 'Galerija', href: '/galerija' },
      { title: 'Izbori', href: '/izbori' },
    ],
  },
  {
    title: 'Općina',
    icon: 'home',
    items: [
      { title: 'O općini', href: '/opcina' },
      { title: 'Naselja', href: '/opcina/naselja' },
      { title: 'Udruge i društva', href: '/opcina/udruge' },
      { title: 'Župa', href: '/opcina/zupa' },
      { title: 'Ustanove', href: '/opcina/ustanove' },
      { title: 'Kontakt', href: '/kontakt' },
    ],
  },
];

// Mobile navigation
export const mainNav: NavItem[] = [
  {
    title: 'Naslovnica',
    href: '/',
  },
  {
    title: 'Općina',
    href: '/opcina',
    items: [
      { title: 'O općini', href: '/opcina' },
      { title: 'Naselja', href: '/opcina/naselja' },
      { title: 'Udruge', href: '/opcina/udruge' },
      { title: 'Župa', href: '/opcina/zupa' },
      { title: 'Ustanove', href: '/opcina/ustanove' },
    ],
  },
  {
    title: 'Organizacija',
    href: '/organizacija',
  },
  {
    title: 'Usluge',
    href: '/usluge',
    items: [
      { title: 'Komunalno', href: '/usluge' },
      { title: 'Financije', href: '/usluge' },
      { title: 'Za građane', href: '/usluge' },
      { title: 'Udruge', href: '/usluge' },
    ],
  },
  {
    title: 'Vijesti',
    href: '/vijesti',
  },
  {
    title: 'Obavijesti',
    href: '/obavijesti',
  },
  {
    title: 'Dokumenti',
    href: '/dokumenti',
  },
  {
    title: 'Galerija',
    href: '/galerija',
  },
  {
    title: 'Izbori',
    href: '/izbori',
  },
  {
    title: 'Kontakt',
    href: '/kontakt',
  },
];

export const footerLinks = [
  {
    title: 'Brze poveznice',
    items: [
      { title: 'Vijesti', href: '/vijesti' },
      { title: 'Obavijesti', href: '/obavijesti' },
      { title: 'Dokumenti', href: '/dokumenti' },
      { title: 'Usluge', href: '/usluge' },
      { title: 'Prijava problema', href: '/prijava-problema' },
    ],
  },
  {
    title: 'Kontakt',
    items: [
      { title: 'Općina Veliki Bukovec', href: '/kontakt' },
      { title: 'Trg svetog Franje 425', href: 'https://maps.google.com' },
      { title: '42231 Veliki Bukovec', href: '/kontakt' },
      { title: 'opcina@velikibukovec.hr', href: 'mailto:opcina@velikibukovec.hr' },
    ],
  },
];

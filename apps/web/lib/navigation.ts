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
      { title: 'Općinska uprava', href: '/organizacija/uprava' },
      { title: 'Općinsko vijeće', href: '/organizacija/vijece' },
      { title: 'Komunalno gospodarstvo', href: '/rad-uprave/komunalno' },
      { title: 'Financiranje udruga', href: '/rad-uprave/udruge' },
      { title: 'Javna nabava', href: 'https://eojn.nn.hr/', external: true },
    ],
  },
  {
    title: 'Informacije',
    icon: 'newspaper',
    items: [
      { title: 'Vijesti', href: '/vijesti' },
      { title: 'Obavijesti', href: '/obavijesti' },
      { title: 'Dokumenti', href: '/dokumenti' },
      { title: 'Proračun', href: '/dokumenti?kategorija=proracun' },
      { title: 'Sjednice vijeća', href: '/dokumenti?kategorija=sjednice' },
      { title: 'Pristup informacijama', href: '/dokumenti/pravo-na-pristup-informacijama' },
    ],
  },
  {
    title: 'Općina',
    icon: 'home',
    items: [
      { title: 'O općini', href: '/opcina/o-nama' },
      { title: 'Turizam', href: '/opcina/turizam' },
      { title: 'Povijest', href: '/opcina/povijest' },
      { title: 'Kontakt', href: '/kontakt' },
    ],
  },
];

// Legacy flat navigation (still used by mobile drawer)
export const mainNav: NavItem[] = [
  {
    title: 'Naslovnica',
    href: '/',
  },
  {
    title: 'Organizacija',
    href: '/organizacija',
    items: [
      { title: 'Općinska uprava', href: '/organizacija/uprava' },
      { title: 'Općinsko vijeće', href: '/organizacija/vijece' },
    ],
  },
  {
    title: 'Rad uprave',
    href: '/rad-uprave',
    items: [
      { title: 'Komunalno gospodarstvo', href: '/rad-uprave/komunalno' },
      { title: 'Financiranje udruga', href: '/rad-uprave/udruge' },
      { title: 'Javna nabava', href: 'https://eojn.nn.hr/' },
    ],
  },
  {
    title: 'Vijesti',
    href: '/vijesti',
    items: [
      { title: 'Sve vijesti', href: '/vijesti' },
      { title: 'Aktualnosti', href: '/vijesti?kategorija=aktualnosti' },
      { title: 'Gospodarstvo', href: '/vijesti?kategorija=gospodarstvo' },
      { title: 'Sport', href: '/vijesti?kategorija=sport' },
      { title: 'Kultura', href: '/vijesti?kategorija=kultura' },
    ],
  },
  {
    title: 'Obavijesti',
    href: '/obavijesti',
    items: [
      { title: 'Sve obavijesti', href: '/obavijesti' },
      { title: 'Natječaji', href: '/obavijesti?kategorija=natjecaj' },
      { title: 'Oglasi', href: '/obavijesti?kategorija=oglas' },
      { title: 'Javni pozivi', href: '/obavijesti?kategorija=poziv' },
    ],
  },
  {
    title: 'Dokumenti',
    href: '/dokumenti',
    items: [
      { title: 'Svi dokumenti', href: '/dokumenti' },
      { title: 'Sjednice vijeća', href: '/dokumenti?kategorija=sjednice' },
      { title: 'Proračun', href: '/dokumenti?kategorija=proracun' },
      { title: 'Prostorni planovi', href: '/dokumenti?kategorija=planovi' },
      { title: 'Pristup informacijama', href: '/dokumenti/pravo-na-pristup-informacijama' },
    ],
  },
  {
    title: 'Općina',
    href: '/opcina',
    items: [
      { title: 'O općini', href: '/opcina/o-nama' },
      { title: 'Turizam', href: '/opcina/turizam' },
      { title: 'Povijest', href: '/opcina/povijest' },
    ],
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
      { title: 'Obavijesti', href: '/obavijesti' },
      { title: 'Natječaji', href: '/obavijesti?kategorija=natjecaj' },
      { title: 'Prijava problema', href: '/prijava-problema' },
      { title: 'Odvoz otpada', href: '/odvoz-otpada' },
      { title: 'Pristup informacijama', href: '/dokumenti/pravo-na-pristup-informacijama' },
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

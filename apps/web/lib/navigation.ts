export type NavItem = {
  title: string;
  href: string;
  items?: { title: string; href: string }[];
};

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
      { title: 'Sjednice vijeća', href: '/organizacija/sjednice' },
      { title: 'Jedinstveni upravni odjel', href: '/organizacija/juo' },
    ],
  },
  {
    title: 'Rad uprave',
    href: '/rad-uprave',
    items: [
      { title: 'Javna nabava', href: 'https://e-nabava.hr' }, // External
      { title: 'Komunalno gospodarstvo', href: '/rad-uprave/komunalno' },
      { title: 'Financiranje udruga', href: '/rad-uprave/udruge' },
      { title: 'Kutak za mještane', href: '/rad-uprave/mjestani' },
      { title: 'Registri i ugovori', href: '/rad-uprave/registri' },
    ],
  },
  {
    title: 'Vijesti',
    href: '/vijesti',
    items: [
      { title: 'Općinske aktualnosti', href: '/vijesti/kategorija/aktualnosti' },
      { title: 'Gospodarstvo', href: '/vijesti/kategorija/gospodarstvo' },
      { title: 'Sport', href: '/vijesti/kategorija/sport' },
      { title: 'Kultura', href: '/vijesti/kategorija/kultura' },
      { title: 'Sve vijesti', href: '/vijesti' },
    ],
  },
  {
    title: 'Dokumenti',
    href: '/dokumenti',
    items: [
      { title: 'Službeni glasnik', href: '/dokumenti/glasnik' },
      { title: 'Proračun', href: '/dokumenti/proracun' },
      { title: 'Prostorni planovi', href: '/dokumenti/prostorni-planovi' },
      { title: 'Svi dokumenti', href: '/dokumenti' },
    ],
  },
  {
    title: 'Općina',
    href: '/opcina',
    items: [
      { title: 'O općini', href: '/opcina/o-nama' },
      { title: 'Turizam', href: '/opcina/turizam' },
      { title: 'Povijest', href: '/opcina/povijest' },
      { title: 'Lokacija', href: '/kontakt' },
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
      { title: 'Natječaji', href: '/natjecaji' },
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

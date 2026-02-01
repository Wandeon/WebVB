// apps/web/lib/experience-items.ts
export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
}

export const experienceItems: ExperienceItem[] = [
  {
    id: 'znamenitosti',
    title: 'Znamenitosti',
    description: 'Dvorac Drašković, crkva sv. Franje Asiškoga i povijesna baština',
    image: '/images/experience/znamenitosti.webp',
    imageAlt: 'Dvorac Drašković u Velikom Bukovcu',
    href: '/dozivi-opcinu/znamenitosti',
  },
  {
    id: 'priroda',
    title: 'Priroda',
    description: 'Rijeke Plitvica i Drava, plodna podravska ravnica',
    image: '/images/experience/priroda.webp',
    imageAlt: 'Prirodni krajolici općine Veliki Bukovec',
    href: '/dozivi-opcinu/priroda',
  },
  {
    id: 'kultura',
    title: 'Kultura i tradicija',
    description: 'Cvjećarska tradicija, vatrogasna društva i narodni običaji',
    image: '/images/experience/kultura.webp',
    imageAlt: 'Kulturna manifestacija u Velikom Bukovcu',
    href: '/dozivi-opcinu/kultura',
  },
];

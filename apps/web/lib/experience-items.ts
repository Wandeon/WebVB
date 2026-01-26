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
    description: 'Crkva sv. Lovre, dvorac Drašković i povijesne građevine',
    image: '/images/experience/znamenitosti.jpg',
    imageAlt: 'Crkva sv. Lovre u Velikom Bukovcu',
    href: '/dozivi-opcinu/znamenitosti',
  },
  {
    id: 'priroda',
    title: 'Priroda',
    description: 'Rijeke Mura i Drava, Natura 2000 područja',
    image: '/images/experience/priroda.jpg',
    imageAlt: 'Rijeka Drava u blizini Velikog Bukovca',
    href: '/dozivi-opcinu/priroda',
  },
  {
    id: 'kultura',
    title: 'Kultura i tradicija',
    description: 'Lokalni običaji, manifestacije i folklor',
    image: '/images/experience/kultura.jpg',
    imageAlt: 'Tradicijska manifestacija u Velikom Bukovcu',
    href: '/dozivi-opcinu/kultura',
  },
];

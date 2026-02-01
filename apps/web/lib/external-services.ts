/**
 * External government services and transparency portals
 * These are legally required or strongly expected for Croatian municipalities
 */

export interface ExternalService {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  category: 'legal' | 'transparency' | 'participation';
  categoryLabel: string;
}

export const externalServices: ExternalService[] = [
  {
    id: 'glasila',
    name: 'Službeni vjesnik',
    description: 'Službeni glasnik Varaždinske županije s pravovaljanim aktima',
    url: 'https://glasila.hr/glasila/sluzbeni-vjesnik-varazdinske-zupanije-1',
    logo: '/images/partners/glasila.svg',
    category: 'legal',
    categoryLabel: 'Službeni akti',
  },
  {
    id: 'imovina',
    name: 'Registar imovine',
    description: 'Evidencija imovine lokalne samouprave',
    url: 'https://v2.imovina.hr/imovina-link.php?o=31317',
    logo: '/images/partners/imovina.png',
    category: 'legal',
    categoryLabel: 'Registri',
  },
  {
    id: 'transparentnost',
    name: 'Transparentnost proračuna',
    description: 'Vizualizacija proračuna s grafovima i usporedbama',
    url: 'https://transparentnost-veliki-bukovec.kipos.hr/',
    logo: '/images/partners/transparentnost.jpg',
    category: 'transparency',
    categoryLabel: 'Proračun',
  },
  {
    id: 'proracun',
    name: 'Proračuni po godinama',
    description: 'Usvojeni proračuni i rebalansi svih godina',
    url: 'https://proracun.hr/proracuni.php?kid=164',
    logo: '/images/partners/proracun.png',
    category: 'transparency',
    categoryLabel: 'Proračun',
  },
  {
    id: 'savjetovanja',
    name: 'Savjetovanja s javnošću',
    description: 'Sudjelujte u donošenju odluka koje vas se tiču',
    url: 'https://proracun.hr/savjetovanja.php?kid=164',
    logo: '/images/partners/savjetovanja.png',
    category: 'participation',
    categoryLabel: 'Sudjelovanje',
  },
];

// Group services by category for organized display
export const servicesByCategory = {
  legal: externalServices.filter((s) => s.category === 'legal'),
  transparency: externalServices.filter((s) => s.category === 'transparency'),
  participation: externalServices.filter((s) => s.category === 'participation'),
};

// Business directory data for Općina Veliki Bukovec
// Data source: official municipal craft/business registry

export type Settlement = 'Veliki Bukovec' | 'Dubovica' | 'Kapela Podravska';

export interface Obrt {
  name: string;
  fullName: string;
  owner: string;
  settlement: Settlement;
  address: string;
  houseNumber: string;
  phone?: string;
  phoneTel?: string;
}

export interface Company {
  name: string;
  shortName: string;
  activity: string;
  address: string;
  settlement: Settlement;
  employees: number;
  email?: string;
  director?: string;
  group?: string;
}

export interface CompanyGroup {
  name: string;
  companies: Company[];
  totalEmployees: number;
}

function formatPhone(raw: string): { display: string; tel: string } | null {
  if (!raw) return null;
  const national = '0' + raw.slice(3);
  const prefix = national.slice(0, 3);
  const rest = national.slice(3);

  let display: string;
  if (rest.length === 7) {
    display = `${prefix}/${rest.slice(0, 3)}-${rest.slice(3)}`;
  } else if (rest.length === 6) {
    display = `${prefix}/${rest.slice(0, 3)}-${rest.slice(3)}`;
  } else {
    display = `${prefix}/${rest}`;
  }

  return { display, tel: `tel:+${raw}` };
}

function phone(raw: string | undefined): Pick<Obrt, 'phone' | 'phoneTel'> {
  if (!raw) return {};
  const result = formatPhone(raw);
  if (!result) return {};
  return { phone: result.display, phoneTel: result.tel };
}

export const obrti: Obrt[] = [
  {
    name: 'AMY-PROM',
    fullName: 'AMY-PROM, obrt za promociju, savjetovanje i odnose s javnošću',
    owner: 'Amalija Šašek',
    settlement: 'Veliki Bukovec',
    address: 'Ulica Franje Sovića',
    houseNumber: '70',
    ...phone('385959159001'),
  },
  {
    name: 'AS NAPUHANCI FUN AND PLAY',
    fullName: 'AS NAPUHANCI FUN AND PLAY, uslužni obrt',
    owner: 'Alen Smontara',
    settlement: 'Veliki Bukovec',
    address: 'Kolarova ulica',
    houseNumber: '9F',
    ...phone('38598509091'),
  },
  {
    name: 'EduConLK',
    fullName: 'EduConLK, obrt za savjetovanje',
    owner: 'Lidija Kralj',
    settlement: 'Veliki Bukovec',
    address: 'Dravska ulica',
    houseNumber: '19',
    ...phone('385915314089'),
  },
  {
    name: 'Frizerski obrt "Sanja"',
    fullName: 'Frizerski obrt "Sanja"',
    owner: 'Sanja Halec',
    settlement: 'Dubovica',
    address: 'Dubovica',
    houseNumber: '43',
  },
  {
    name: 'GEJA',
    fullName: 'GEJA, poljoprivredno peradarski obrt',
    owner: 'Andreja Vrbanić',
    settlement: 'Dubovica',
    address: 'Dubovica',
    houseNumber: '88',
  },
  {
    name: 'HALEC',
    fullName: 'HALEC, obrt za poljoprivredu, trgovinu i usluge',
    owner: 'Josip Halec',
    settlement: 'Dubovica',
    address: 'Dubovica',
    houseNumber: '28',
    ...phone('385915524613'),
  },
  {
    name: 'LA VITA BELLA',
    fullName: 'LA VITA BELLA, obrt za dekoriranje i usluge',
    owner: 'Petra Vručina',
    settlement: 'Dubovica',
    address: 'Dubovica',
    houseNumber: '18',
    ...phone('385911775579'),
  },
  {
    name: 'MAT-L metal',
    fullName: 'MAT-L metal, uslužni obrt',
    owner: 'Matija Jakopčin',
    settlement: 'Dubovica',
    address: 'Dubovica',
    houseNumber: '44',
    ...phone('385994567202'),
  },
  {
    name: 'NENO',
    fullName: 'NENO, obrt za prijevoz i usluge',
    owner: 'Nenad Šercer',
    settlement: 'Veliki Bukovec',
    address: 'Ulica Franje Sovića',
    houseNumber: '23',
    ...phone('385914554550'),
  },
  {
    name: 'NUTRITINA',
    fullName: 'NUTRITINA, obrt za nutricionizam',
    owner: 'Martina Gložinić Barulek',
    settlement: 'Kapela Podravska',
    address: 'Kapela Podravska',
    houseNumber: '55',
    ...phone('385998752534'),
  },
  {
    name: 'Obrt za izradu strojeva i bravariju',
    fullName: 'Obrt za izradu strojeva, metalnih konstrukcija i bravariju',
    owner: 'Božidar Mužic',
    settlement: 'Kapela Podravska',
    address: 'Kapela Podravska',
    houseNumber: '10',
    ...phone('385959056295'),
  },
  {
    name: 'P & G',
    fullName: 'P & G, obrt za obradu metala i popravak poljoprivrednih strojeva',
    owner: 'Mladen Gača',
    settlement: 'Veliki Bukovec',
    address: 'Dravska ulica',
    houseNumber: '46',
    ...phone('38598482608'),
  },
  {
    name: 'SD INOX',
    fullName: 'SD INOX, obrt za obradu metala',
    owner: 'Danijel Sačer',
    settlement: 'Veliki Bukovec',
    address: 'Ulica Franje Sovića',
    houseNumber: '82',
    ...phone('385989098892'),
  },
  {
    name: 'SILO-MONT POŽGAJ',
    fullName: 'SILO-MONT POŽGAJ, obrt za izradu i montažu silosa i opreme',
    owner: 'Bojana Požgaj',
    settlement: 'Veliki Bukovec',
    address: 'Dravska ulica',
    houseNumber: '19',
    ...phone('385994800000'),
  },
  {
    name: 'SMONTARA',
    fullName: 'SMONTARA, obrt za poljoprivredu, usluge i trgovinu',
    owner: 'Dino Smontara',
    settlement: 'Veliki Bukovec',
    address: 'Kolarova ulica',
    houseNumber: '9H',
    ...phone('385915535371'),
  },
  {
    name: 'SMONTARA',
    fullName: 'SMONTARA, strojobravarski obrt',
    owner: 'Zdravko Smontara',
    settlement: 'Kapela Podravska',
    address: 'Kapela Podravska',
    houseNumber: '71',
    ...phone('385911102963'),
  },
  {
    name: 'TREE PROFILE',
    fullName: 'TREE PROFILE, stolarski obrt',
    owner: 'Tomica Mlinar',
    settlement: 'Kapela Podravska',
    address: 'Kapela Podravska',
    houseNumber: '47',
    ...phone('38598267204'),
  },
  {
    name: 'TF',
    fullName: 'TF, obrt za strojnu obradu metala',
    owner: 'Tomislav Gača',
    settlement: 'Veliki Bukovec',
    address: 'Dravska ulica',
    houseNumber: '46',
    ...phone('385996779311'),
  },
  {
    name: 'TRIPLAT',
    fullName: 'TRIPLAT, obrt za postavljanje keramike',
    owner: 'Tihomir Triplat',
    settlement: 'Veliki Bukovec',
    address: 'Ulica Franje Sovića',
    houseNumber: '76',
    ...phone('385992043775'),
  },
  {
    name: 'Ugostiteljski obrt',
    fullName: 'Ugostiteljski obrt',
    owner: 'Željka Stankir',
    settlement: 'Veliki Bukovec',
    address: 'Dravska ulica',
    houseNumber: '52',
    ...phone('385919255111'),
  },
  {
    name: 'ZLATNA TAJNA',
    fullName: 'ZLATNA TAJNA, obrt za proizvodnju i usluge',
    owner: 'Mateja Povijač',
    settlement: 'Veliki Bukovec',
    address: 'Ulica Franje Sovića',
    houseNumber: '8',
  },
  {
    name: 'ZORKO-TRANS',
    fullName: 'ZORKO-TRANS, obrt za prijevoz, trgovinu i usluge',
    owner: 'Zoran Kovačić',
    settlement: 'Kapela Podravska',
    address: 'Kapela Podravska',
    houseNumber: '26',
    ...phone('385996761435'),
  },
];

// Companies grouped by ownership
export const companyGroups: CompanyGroup[] = [
  {
    name: 'Stolarija Pečenec',
    totalEmployees: 194,
    companies: [
      {
        name: 'Stolarija - Pilana Antun Pečenec d.o.o.',
        shortName: 'Stolarija Pečenec',
        activity: 'Proizvodnja furnira i ploča od drva',
        address: 'Kapela Podravska 143',
        settlement: 'Kapela Podravska',
        employees: 194,
        email: 'pecenec@pecenec.hr',
        director: 'Valentina Pečenec',
        group: 'Stolarija Pečenec',
      },
    ],
  },
  {
    name: 'Požgaj grupa',
    totalEmployees: 277,
    companies: [
      {
        name: 'Požgaj Grupa d.o.o.',
        shortName: 'Požgaj Grupa',
        activity: 'Piljenje i blanjanje drva',
        address: 'Dravska ulica 24',
        settlement: 'Veliki Bukovec',
        employees: 41,
        email: 'racunovodstvo@pozgaj.com',
        director: 'Nikola Požgaj',
        group: 'Požgaj grupa',
      },
      {
        name: 'Massive Panels d.o.o.',
        shortName: 'Massive Panels',
        activity: 'Piljenje i blanjanje drva',
        address: 'Dravska ulica 24',
        settlement: 'Veliki Bukovec',
        employees: 96,
        email: 'racunovodstvo@pozgaj.com',
        director: 'Nikola Požgaj',
        group: 'Požgaj grupa',
      },
      {
        name: 'Massive Lumber d.o.o.',
        shortName: 'Massive Lumber',
        activity: 'Piljenje i blanjanje drva',
        address: 'Dravska ulica 24',
        settlement: 'Veliki Bukovec',
        employees: 42,
        email: 'racunovodstvo@pozgaj.com',
        director: 'Nikola Požgaj',
        group: 'Požgaj grupa',
      },
      {
        name: 'Massive Flooring d.o.o.',
        shortName: 'Massive Flooring',
        activity: 'Piljenje i blanjanje drva',
        address: 'Dravska ulica 24',
        settlement: 'Veliki Bukovec',
        employees: 38,
        email: 'racunovodstvo@pozgaj.com',
        director: 'Nikola Požgaj',
        group: 'Požgaj grupa',
      },
      {
        name: 'Massive Houses d.o.o.',
        shortName: 'Massive Houses',
        activity: 'Piljenje i blanjanje drva',
        address: 'Dravska ulica 24',
        settlement: 'Veliki Bukovec',
        employees: 20,
        email: 'racunovodstvo@pozgaj.com',
        director: 'Nikola Požgaj',
        group: 'Požgaj grupa',
      },
      {
        name: 'Massive Holding d.o.o.',
        shortName: 'Massive Holding',
        activity: 'Otkup i veleprodaja drva',
        address: 'Dravska ulica 24',
        settlement: 'Veliki Bukovec',
        employees: 10,
        email: 'racunovodstvo@pozgaj.com',
        director: 'Nikola Požgaj',
        group: 'Požgaj grupa',
      },
      {
        name: 'T.C. Požgaj d.o.o.',
        shortName: 'T.C. Požgaj',
        activity: 'Trgovina na malo',
        address: 'Dravska ulica 24',
        settlement: 'Veliki Bukovec',
        employees: 10,
        email: 'racunovodstvo@pozgaj.com',
        director: 'Nikola Požgaj',
        group: 'Požgaj grupa',
      },
      {
        name: 'Clean Energy d.o.o.',
        shortName: 'Clean Energy',
        activity: 'Proizvodnja električne energije iz obnovljivih izvora',
        address: 'Dravska ulica 40',
        settlement: 'Veliki Bukovec',
        employees: 0,
        email: 'racunovodstvo@pozgaj.com',
        director: 'Nikola Požgaj, Duško Kanižaj',
        group: 'Požgaj grupa',
      },
      {
        name: 'JP Productions d.o.o.',
        shortName: 'JP Productions',
        activity: 'Proizvodnja filmova i televizijskog programa',
        address: 'Dravska ulica 24',
        settlement: 'Veliki Bukovec',
        employees: 1,
        director: 'Josip Požgaj',
        group: 'Požgaj grupa',
      },
    ],
  },
  {
    name: 'PG Orehovec grupa',
    totalEmployees: 103,
    companies: [
      {
        name: 'PG Orehovec',
        shortName: 'PG Orehovec',
        activity: 'Prerada mesa i peradarska proizvodnja',
        address: 'Ulica Franje Sovića 45',
        settlement: 'Veliki Bukovec',
        employees: 17,
        group: 'PG Orehovec grupa',
      },
      {
        name: 'Kukuriku d.o.o.',
        shortName: 'Kukuriku',
        activity: 'Cestovni prijevoz robe',
        address: 'Ulica Stjepana Modrića 31',
        settlement: 'Veliki Bukovec',
        employees: 37,
        email: 'orehovec@pgorehovec.hr',
        director: 'Andreja Pečenec',
        group: 'PG Orehovec grupa',
      },
      {
        name: 'Kata j.d.o.o.',
        shortName: 'Kata',
        activity: 'Prerada i konzerviranje mesa peradi',
        address: 'Ulica Franje Sovića 31/A',
        settlement: 'Veliki Bukovec',
        employees: 13,
        email: 'orehovec@pgorehovec.hr',
        director: 'Željko Orehovec',
        group: 'PG Orehovec grupa',
      },
      {
        name: 'Agro-Ore d.o.o.',
        shortName: 'Agro-Ore',
        activity: 'Uzgoj peradi',
        address: 'Ulica Franje Sovića 45',
        settlement: 'Veliki Bukovec',
        employees: 13,
        email: 'orehovec@pgorehovec.hr',
        director: 'Juraj Orehovec',
        group: 'PG Orehovec grupa',
      },
      {
        name: 'Agrobrojler d.o.o.',
        shortName: 'Agrobrojler',
        activity: 'Uzgoj peradi',
        address: 'Ulica 1. maja 12',
        settlement: 'Veliki Bukovec',
        employees: 12,
        email: 'orehovec@pgorehovec.hr',
        director: 'Siniša Križan',
        group: 'PG Orehovec grupa',
      },
      {
        name: 'Poljovel d.o.o.',
        shortName: 'Poljovel',
        activity: 'Uzgoj peradi',
        address: 'Ulica Franje Sovića 31/A',
        settlement: 'Veliki Bukovec',
        employees: 11,
        email: 'orehovec@pgorehovec.hr',
        director: 'Vesna Sabol',
        group: 'PG Orehovec grupa',
      },
      {
        name: 'Agrovel d.o.o.',
        shortName: 'Agrovel',
        activity: 'Uzgoj peradi',
        address: 'Ulica Franje Sovića 45',
        settlement: 'Veliki Bukovec',
        employees: 3,
        email: 'orehovec@pgorehovec.hr',
        director: 'Željko Orehovec',
        group: 'PG Orehovec grupa',
      },
      {
        name: 'Galus d.o.o.',
        shortName: 'Galus',
        activity: 'Uzgoj peradi',
        address: 'Ulica Franje Sovića 31/A',
        settlement: 'Veliki Bukovec',
        employees: 0,
        email: 'orehovec@pgorehovec.hr',
        director: 'Željko Orehovec',
        group: 'PG Orehovec grupa',
      },
    ],
  },
  {
    name: 'Šljunčara Smontara',
    totalEmployees: 67,
    companies: [
      {
        name: 'Šljunčara-Transporti Smontara d.o.o.',
        shortName: 'Šljunčara Smontara',
        activity: 'Eksploatacija šljunka i pijeska, prijevoz',
        address: 'Ulica Franje Sovića 90',
        settlement: 'Veliki Bukovec',
        employees: 67,
        email: 'info@smontara.hr',
        director: 'Tihomir Smontara, Ivan Smontara',
        group: 'Šljunčara Smontara',
      },
    ],
  },
  {
    name: 'Trako grupa',
    totalEmployees: 5,
    companies: [
      {
        name: 'Trako-Agroludbreg d.o.o.',
        shortName: 'Trako-Agroludbreg',
        activity: 'Uzgoj jednogodišnjih usjeva',
        address: 'Dravska ulica 7',
        settlement: 'Veliki Bukovec',
        employees: 5,
        email: 'l.cus@trako.eu',
        director: 'Ivan Domislović',
        group: 'Trako grupa',
      },
      {
        name: 'Trako Holding d.o.o.',
        shortName: 'Trako Holding',
        activity: 'Holding društvo',
        address: 'Dravska ulica 7',
        settlement: 'Veliki Bukovec',
        employees: 0,
        email: 'office@trako.eu',
        director: 'Nikolaus Peter Draskovich, Ivan Domislović',
        group: 'Trako grupa',
      },
      {
        name: 'Trako Nekretnine d.o.o.',
        shortName: 'Trako Nekretnine',
        activity: 'Poslovanje nekretninama',
        address: 'Dravska ulica 7',
        settlement: 'Veliki Bukovec',
        employees: 0,
        email: 'l.cus@trako.eu',
        director: 'Ivan Domislović',
        group: 'Trako grupa',
      },
      {
        name: 'Uprava Dobra, obrt',
        shortName: 'Uprava Dobra',
        activity: 'Upravljanje nekretninama',
        address: 'Dravska ulica 7',
        settlement: 'Veliki Bukovec',
        employees: 0,
        director: 'Nikolaus Peter Draskovich',
        group: 'Trako grupa',
      },
    ],
  },
  {
    name: 'Samostalne tvrtke',
    totalEmployees: 35,
    companies: [
      {
        name: 'Agro Tim Halec d.o.o.',
        shortName: 'Agro Tim Halec',
        activity: 'Trgovina na veliko žitaricama i stočnom hranom',
        address: 'Dubovica 28',
        settlement: 'Dubovica',
        employees: 0,
        email: 'sanja.halec1@gmail.com',
        director: 'Sanja Halec',
      },
      {
        name: 'LTK d.o.o.',
        shortName: 'LTK',
        activity: 'Eksploatacija šljunka i pijeska',
        address: 'Kapela Podravska',
        settlement: 'Kapela Podravska',
        employees: 5,
        director: 'Dragan Kolić',
      },
      {
        name: 'Tres-M-Flos d.o.o.',
        shortName: 'Tres-M-Flos',
        activity: 'Nespecijalizirana trgovina na veliko',
        address: 'Dravska ulica 19/B',
        settlement: 'Veliki Bukovec',
        employees: 1,
        email: 'tres.m.flos@gmail.com',
        director: 'Đurđica Mesarić',
      },
      {
        name: 'Sova Barovi j.d.o.o.',
        shortName: 'Sova Barovi',
        activity: 'Ugostiteljstvo - priprema i usluživanje pića',
        address: 'Ulica Franje Sovića 11',
        settlement: 'Veliki Bukovec',
        employees: 4,
        email: 'caffe.bukovecki.dvorac@gmail.com',
        director: 'Željko Sović',
      },
      {
        name: 'Silos Produkt d.o.o.',
        shortName: 'Silos Produkt',
        activity: 'Proizvodnja metalnih konstrukcija',
        address: 'Ulica Franje Sovića 24/F',
        settlement: 'Veliki Bukovec',
        employees: 2,
        email: 'info@silo-mont-pozgaj.hr',
        director: 'Aleksandar Vrbanić',
      },
      {
        name: 'Hills Gym d.o.o.',
        shortName: 'Hills Gym',
        activity: 'Fitness centar',
        address: 'Ulica Stjepana Modrića 37',
        settlement: 'Veliki Bukovec',
        employees: 2,
        email: 'avrbanic.vrbanic@gmail.com',
        director: 'Adam Vrbanić',
      },
      {
        name: 'Frenky Transporti d.o.o.',
        shortName: 'Frenky Transporti',
        activity: 'Cestovni prijevoz robe',
        address: 'Ulica Franje Sovića 7',
        settlement: 'Veliki Bukovec',
        employees: 2,
        email: 'frenkytransporti@gmail.com',
        director: 'Franjo Modrić',
      },
      {
        name: 'Hemar d.o.o.',
        shortName: 'Hemar',
        activity: 'Radovi na krovištu',
        address: 'Kapela Podravska 133',
        settlement: 'Kapela Podravska',
        employees: 5,
        director: 'Sebastijan Kovaček',
      },
      {
        name: 'Vila Sabol d.o.o.',
        shortName: 'Vila Sabol',
        activity: 'Instalacije vodovoda, kanalizacije i grijanja',
        address: 'Dubovica 61/A',
        settlement: 'Dubovica',
        employees: 1,
        email: 'ivan.sabol07@gmail.com',
        director: 'Ivan Sabol',
      },
      {
        name: 'ZP-Zdelarpackaging d.o.o.',
        shortName: 'ZP-Zdelarpackaging',
        activity: 'Proizvodnja ambalaže od drva',
        address: 'Kapela Podravska 44',
        settlement: 'Kapela Podravska',
        employees: 1,
        email: 'zdelarf@gmail.com',
        director: 'Filip Zdelar',
      },
      {
        name: 'Amadori d.o.o.',
        shortName: 'Amadori',
        activity: 'Trgovina na veliko drvom i građevinskim materijalom',
        address: 'Dravska ulica 102',
        settlement: 'Veliki Bukovec',
        employees: 1,
        email: 'franjo@amadori.hr',
        director: 'Franjo Amadori',
      },
      {
        name: 'DS Wood d.o.o.',
        shortName: 'DS Wood',
        activity: 'Cestovni prijevoz robe',
        address: 'Dravska ulica 36/F',
        settlement: 'Veliki Bukovec',
        employees: 1,
        email: 'damistef600@gmail.com',
        director: 'Damir Štefanec',
      },
      {
        name: 'Setnik Markač Marketing d.o.o.',
        shortName: 'Setnik Markač Marketing',
        activity: 'Proizvodnja filmova i videofilmova',
        address: 'Dubovica 104',
        settlement: 'Dubovica',
        employees: 0,
        email: 'setnik.mirela@gmail.com',
        director: 'Mirela Markač',
      },
      {
        name: '3Duba j.d.o.o.',
        shortName: '3Duba',
        activity: 'Arhitektonsko projektiranje',
        address: 'Kapela Podravska 92',
        settlement: 'Kapela Podravska',
        employees: 1,
        email: 'dpinteric@gmail.com',
        director: 'Dubravka Pinterić',
      },
      {
        name: 'Zlatni Rog d.o.o.',
        shortName: 'Zlatni Rog',
        activity: 'Proizvodnja mliječnih proizvoda',
        address: 'Dubovica 53',
        settlement: 'Dubovica',
        employees: 1,
        email: 'zlatnirog123@gmail.com',
        director: 'Karmen Varga',
      },
    ],
  },
];

export const settlements: Settlement[] = ['Veliki Bukovec', 'Dubovica', 'Kapela Podravska'];

export function groupObrtiBySettlement(items: Obrt[]): Record<Settlement, Obrt[]> {
  const grouped: Record<Settlement, Obrt[]> = {
    'Veliki Bukovec': [],
    'Dubovica': [],
    'Kapela Podravska': [],
  };
  for (const b of items) {
    grouped[b.settlement].push(b);
  }
  return grouped;
}

export function getTotalEmployees(): number {
  return companyGroups.reduce((sum, g) => sum + g.totalEmployees, 0);
}

export function getTotalCompanies(): number {
  return companyGroups.reduce((sum, g) => sum + g.companies.length, 0);
}

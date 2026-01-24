export const POST_CATEGORIES = {
  aktualnosti: 'Opcinske aktualnosti',
  gospodarstvo: 'Gospodarstvo',
  sport: 'Sport',
  komunalno: 'Komunalne teme',
  kultura: 'Kultura',
  obrazovanje: 'Obrazovanje',
  ostalo: 'Ostalo',
} as const;

export type PostCategory = keyof typeof POST_CATEGORIES;

export const POST_CATEGORY_OPTIONS = Object.entries(POST_CATEGORIES).map(
  ([value, label]) => ({ value, label })
);

export const DOCUMENT_CATEGORIES = {
  sjednice: 'Sjednice općinskog vijeća',
  proracun: 'Proračun i financijski izvještaji',
  planovi: 'Prostorni i urbanistički planovi',
  javna_nabava: 'Javna nabava',
  izbori: 'Izbori i referendumi',
  obrasci: 'Obrasci za građane',
  odluke: 'Odluke i zaključci',
  izvjesca: 'Izvješća',
  strateski_dokumenti: 'Strateški dokumenti',
  zakoni_i_propisi: 'Zakoni i propisi',
  ostalo: 'Ostalo',
} as const;

export type DocumentCategory = keyof typeof DOCUMENT_CATEGORIES;

export const DOCUMENT_CATEGORY_OPTIONS = Object.entries(DOCUMENT_CATEGORIES).map(
  ([value, label]) => ({ value, label })
);

export const DOCUMENT_MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const DOCUMENT_MAX_SIZE_MB = 20;

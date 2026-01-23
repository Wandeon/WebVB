// App-wide constants matching database constraints

export const APP_NAME = 'Veliki Bukovec';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export const POST_CATEGORIES = [
  'aktualnosti',
  'gospodarstvo',
  'sport',
  'komunalno',
  'kultura',
  'obrazovanje',
  'ostalo',
] as const;

export const POST_CATEGORY_LABELS: Record<string, string> = {
  aktualnosti: 'Aktualnosti',
  gospodarstvo: 'Gospodarstvo',
  sport: 'Sport',
  komunalno: 'Komunalno',
  kultura: 'Kultura',
  obrazovanje: 'Obrazovanje',
  ostalo: 'Ostalo',
};

export const PROBLEM_TYPES = [
  'cesta',
  'rasvjeta',
  'otpad',
  'komunalno',
  'ostalo',
] as const;

export const PROBLEM_TYPE_LABELS: Record<string, string> = {
  cesta: 'Problem s cestom',
  rasvjeta: 'Javna rasvjeta',
  otpad: 'Otpad i čistoća',
  komunalno: 'Komunalna infrastruktura',
  ostalo: 'Ostalo',
};

export const CONTACT_STATUSES = ['new', 'read', 'replied', 'archived'] as const;

export const PROBLEM_STATUSES = ['new', 'in_progress', 'resolved', 'rejected'] as const;

export const DOCUMENT_CATEGORIES = [
  'sjednice',
  'izbori',
  'planovi',
  'proracun',
  'natjecaji',
  'ostalo',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

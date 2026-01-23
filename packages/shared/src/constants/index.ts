// App-wide constants

export const APP_NAME = 'Veliki Bukovec';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export const NEWS_CATEGORIES = [
  'opcinske-aktualnosti',
  'gospodarstvo',
  'sport',
  'komunalne-teme',
  'kultura',
  'obrazovanje',
  'ostalo',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

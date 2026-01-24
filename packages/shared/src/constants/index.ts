// App-wide constants matching database constraints

export const APP_NAME = 'Veliki Bukovec';

export const ADMIN_APP_URL_DEFAULT = 'http://localhost:3001';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

// Re-export post categories from dedicated file
export { POST_CATEGORIES, POST_CATEGORY_OPTIONS, type PostCategory } from './categories';

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

// Re-export document constants from dedicated file
export {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_OPTIONS,
  DOCUMENT_MAX_SIZE_BYTES,
  DOCUMENT_MAX_SIZE_MB,
  type DocumentCategory,
} from './documents';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

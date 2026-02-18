export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_ENTITY_TYPES = {
  ANNOUNCEMENT: 'announcement',
  DOCUMENT: 'document',
  EVENT: 'event',
  GALLERY: 'gallery',
  PAGE: 'page',
  POST: 'post',
  UPLOAD: 'upload',
  USER: 'user',
} as const;

export type AuditEntityType =
  (typeof AUDIT_ENTITY_TYPES)[keyof typeof AUDIT_ENTITY_TYPES];

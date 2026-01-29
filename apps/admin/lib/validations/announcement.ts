import { ANNOUNCEMENT_CATEGORIES } from '@repo/shared';
import { z } from 'zod';

// Derive category enum from shared constants (single source of truth)
const categoryKeys = Object.keys(ANNOUNCEMENT_CATEGORIES) as [
  keyof typeof ANNOUNCEMENT_CATEGORIES,
  ...Array<keyof typeof ANNOUNCEMENT_CATEGORIES>
];

export const announcementSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 znaka')
    .max(300, 'Naslov može imati najviše 300 znakova'),
  content: z.string().optional().nullable(),
  excerpt: z.string().max(500, 'Sažetak može imati najviše 500 znakova').optional().nullable(),
  category: z.enum(categoryKeys),
  validFrom: z.date().nullable().optional(),
  validUntil: z.date().nullable().optional(),
  publishedAt: z.date().nullable().optional(),
});

export const createAnnouncementSchema = announcementSchema.refine(
  (data) => {
    if (data.validFrom && data.validUntil) {
      return data.validFrom <= data.validUntil;
    }
    return true;
  },
  {
    message: 'Datum početka mora biti prije datuma završetka',
    path: ['validUntil'],
  }
);

export const updateAnnouncementSchema = announcementSchema.partial().extend({
  id: z.string().uuid(),
}).refine(
  (data) => {
    if (data.validFrom && data.validUntil) {
      return data.validFrom <= data.validUntil;
    }
    return true;
  },
  {
    message: 'Datum početka mora biti prije datuma završetka',
    path: ['validUntil'],
  }
);

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

// For API query params
export const announcementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['all', 'draft', 'published', 'active', 'expired']).default('all'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'publishedAt', 'validUntil']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AnnouncementQueryInput = z.infer<typeof announcementQuerySchema>;

// Attachment schemas
export const addAttachmentSchema = z.object({
  fileName: z.string().min(1, 'Naziv datoteke je obavezan'),
  fileUrl: z.string().url('Nevažeća URL adresa'),
  fileSize: z.number().int().positive('Veličina datoteke mora biti pozitivan broj'),
  mimeType: z.string().default('application/pdf'),
});

export const reorderAttachmentsSchema = z.object({
  attachmentIds: z.array(z.string().uuid()).min(1, 'Potreban je barem jedan privitak'),
});

export type AddAttachmentInput = z.infer<typeof addAttachmentSchema>;
export type ReorderAttachmentsInput = z.infer<typeof reorderAttachmentsSchema>;

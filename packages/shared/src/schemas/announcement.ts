import { z } from 'zod';

import { ANNOUNCEMENT_CATEGORIES } from '../constants';

const categoryKeys = Object.keys(ANNOUNCEMENT_CATEGORIES) as [
  keyof typeof ANNOUNCEMENT_CATEGORIES,
  ...Array<keyof typeof ANNOUNCEMENT_CATEGORIES>
];

export const announcementSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 znaka')
    .max(300, 'Naslov može imati najviše 300 znakova'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug može sadržavati samo mala slova, brojeve i crtice')
    .optional(),
  content: z.string().optional().nullable(),
  excerpt: z.string().max(500, 'Sažetak može imati najviše 500 znakova').optional().nullable(),
  category: z.enum(categoryKeys, {
    message: 'Kategorija je obavezna',
  }).default('obavijest'),
  validFrom: z.coerce.date().optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  publishedAt: z.coerce.date().optional().nullable(),
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

export const announcementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.enum(categoryKeys).optional(),
  status: z.enum(['all', 'draft', 'published', 'active', 'expired']).default('all'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'publishedAt', 'validUntil']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AnnouncementQueryInput = z.infer<typeof announcementQuerySchema>;

// Attachment schemas
export const announcementAttachmentSchema = z.object({
  fileName: z.string().min(1, 'Naziv datoteke je obavezan'),
  fileUrl: z.string().url('Nevažeća URL adresa'),
  fileSize: z.number().int().positive('Veličina datoteke mora biti pozitivan broj'),
  mimeType: z.string().default('application/pdf'),
  sortOrder: z.number().int().min(0).default(0),
});

export const addAttachmentSchema = announcementAttachmentSchema;

export const reorderAttachmentsSchema = z.object({
  attachmentIds: z.array(z.string().uuid()).min(1, 'Potreban je barem jedan privitak'),
});

export type AnnouncementAttachmentInput = z.infer<typeof announcementAttachmentSchema>;
export type AddAttachmentInput = z.infer<typeof addAttachmentSchema>;
export type ReorderAttachmentsInput = z.infer<typeof reorderAttachmentsSchema>;

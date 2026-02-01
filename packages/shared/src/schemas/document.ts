import { z } from 'zod';

import { DOCUMENT_CATEGORIES, DOCUMENT_MAX_SIZE_BYTES, DOCUMENT_MAX_SIZE_MB } from '../constants/documents';

const categoryKeys = Object.keys(DOCUMENT_CATEGORIES) as [
  keyof typeof DOCUMENT_CATEGORIES,
  ...Array<keyof typeof DOCUMENT_CATEGORIES>
];

const currentYear = new Date().getFullYear();

export const documentSchema = z
  .object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 znaka')
    .max(300, 'Naslov može imati najviše 300 znakova'),
  category: z.enum(categoryKeys, {
    message: 'Kategorija je obavezna',
  }),
  subcategory: z.string().max(100).nullable().optional(),
  year: z
    .number()
    .int()
    .min(1990, 'Godina mora biti između 1990 i sljedeće godine')
    .max(currentYear + 1, 'Godina mora biti između 1990 i sljedeće godine')
    .nullable()
    .optional(),
})
  .strict();

export const createDocumentSchema = documentSchema.extend({
  fileSize: z
    .number()
    .int()
    .positive()
    .max(DOCUMENT_MAX_SIZE_BYTES, `Datoteka je prevelika (max ${DOCUMENT_MAX_SIZE_MB}MB)`),
  fileUrl: z.string().url(),
});

export const updateDocumentSchema = documentSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .strict();

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export const documentQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().max(200).optional(),
    category: z.enum(categoryKeys).optional(),
    year: z.coerce.number().int().optional(),
    sortBy: z.enum(['createdAt', 'title', 'year', 'fileSize']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;

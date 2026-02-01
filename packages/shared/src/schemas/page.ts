import { z } from 'zod';

export const pageSchema = z
  .object({
  title: z
    .string()
    .min(2, 'Naslov mora imati najmanje 2 znaka')
    .max(200, 'Naslov može imati najviše 200 znakova'),
  content: z
    .string()
    .min(1, 'Sadržaj je obavezan')
    .refine(
      (val) => {
        const textContent = val.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 0;
      },
      { message: 'Sadržaj je obavezan' }
    ),
  parentId: z.string().uuid().nullable().optional(),
  menuOrder: z.number().int().min(0).default(0),
})
  .strict();

export const createPageSchema = pageSchema;
export const updatePageSchema = pageSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .strict();

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

export const pageQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().max(200).optional(),
    parentId: z.string().uuid().nullable().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'menuOrder']).default('menuOrder'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict();

export type PageQueryInput = z.infer<typeof pageQuerySchema>;

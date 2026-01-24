import { z } from 'zod';

export const postSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 znaka')
    .max(200, 'Naslov moze imati najvise 200 znakova'),
  content: z.string().min(1, 'Sadrzaj je obavezan'),
  excerpt: z.string().max(500, 'Sazetak moze imati najvise 500 znakova').optional(),
  category: z.enum([
    'aktualnosti',
    'gospodarstvo',
    'sport',
    'komunalno',
    'kultura',
    'obrazovanje',
    'ostalo',
  ]),
  isFeatured: z.boolean().default(false),
  publishedAt: z.date().nullable().optional(),
});

export const createPostSchema = postSchema;
export const updatePostSchema = postSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

// For API query params
export const postQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['all', 'draft', 'published']).default('all'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'publishedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PostQueryInput = z.infer<typeof postQuerySchema>;

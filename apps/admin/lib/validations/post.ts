import { POST_CATEGORIES } from '@repo/shared';
import { z } from 'zod';

// Derive category enum from shared constants (single source of truth)
const categoryKeys = Object.keys(POST_CATEGORIES) as [keyof typeof POST_CATEGORIES, ...Array<keyof typeof POST_CATEGORIES>];

export const postSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 znaka')
    .max(200, 'Naslov može imati najviše 200 znakova'),
  content: z
    .string()
    .min(1, 'Sadržaj je obavezan')
    .refine(
      (val) => {
        // Strip HTML tags and check if there's actual content
        const textContent = val.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 0;
      },
      { message: 'Sadržaj je obavezan' }
    ),
  excerpt: z.string().max(500, 'Sažetak može imati najviše 500 znakova').optional(),
  category: z.enum(categoryKeys),
  isFeatured: z.boolean(),
  featuredImage: z.string().url().nullable().optional(),
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

import { z } from 'zod';

export const gallerySchema = z.object({
  name: z
    .string()
    .min(2, 'Naziv mora imati najmanje 2 znaka')
    .max(200, 'Naziv može imati najviše 200 znakova'),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  eventDate: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  coverImage: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export const createGallerySchema = gallerySchema;
export const updateGallerySchema = gallerySchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;

export const galleryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'eventDate', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GalleryQueryInput = z.infer<typeof galleryQuerySchema>;

export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string().uuid()),
});

export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;

export const addGalleryImagesSchema = z.object({
  images: z.array(
    z.object({
      imageUrl: z.string().url(),
      thumbnailUrl: z.string().url().nullable().optional(),
      caption: z.string().nullable().optional(),
    })
  ),
});

export type AddGalleryImagesInput = z.infer<typeof addGalleryImagesSchema>;

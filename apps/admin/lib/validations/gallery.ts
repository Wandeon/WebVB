import { z } from 'zod';

export const galleryFormSchema = z.object({
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

export const createGallerySchema = galleryFormSchema;

export const updateGallerySchema = galleryFormSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;

export const galleryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'eventDate', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GalleryQueryInput = z.infer<typeof galleryQuerySchema>;

export const reorderImagesSchema = z.object({
  imageIds: z
    .array(z.string().uuid())
    .min(1, 'Potreban je barem jedan ID slike'),
});

export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;

export const addGalleryImagesSchema = z.object({
  images: z
    .array(
      z.object({
        imageUrl: z.string().url('Nevaljani URL slike'),
        thumbnailUrl: z
          .string()
          .url()
          .nullable()
          .optional()
          .transform((val) => val || null),
        caption: z
          .string()
          .max(500, 'Opis može imati najviše 500 znakova')
          .nullable()
          .optional()
          .transform((val) => val || null),
      })
    )
    .min(1, 'Potrebna je barem jedna slika'),
});

export type AddGalleryImagesInput = z.infer<typeof addGalleryImagesSchema>;

export const updateImageCaptionSchema = z.object({
  caption: z
    .string()
    .max(500, 'Opis može imati najviše 500 znakova')
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export type UpdateImageCaptionInput = z.infer<typeof updateImageCaptionSchema>;

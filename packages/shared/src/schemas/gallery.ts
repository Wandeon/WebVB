import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateString = (value: string) => {
  if (!dateRegex.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return parsed.toISOString().slice(0, 10) === value;
};

export const gallerySchema = z
  .object({
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
      .union([
        z
          .string()
          .regex(dateRegex, 'Datum mora biti u formatu GGGG-MM-DD')
          .refine(isValidDateString, { message: 'Nevažeći datum' }),
        z.literal(''),
        z.null(),
      ])
      .transform((val) => (val ? val : null))
      .optional(),
    coverImage: z
      .string()
      .url()
      .nullable()
      .optional()
      .transform((val) => val || null),
  })
  .strict();

export const createGallerySchema = gallerySchema;
export const updateGallerySchema = gallerySchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .strict();

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;

export const galleryQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().max(200).optional(),
    sortBy: z.enum(['createdAt', 'eventDate', 'name']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export type GalleryQueryInput = z.infer<typeof galleryQuerySchema>;

export const reorderImagesSchema = z
  .object({
    imageIds: z.array(z.string().uuid()),
  })
  .strict();

export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;

export const addGalleryImagesSchema = z
  .object({
    images: z.array(
      z
        .object({
          imageUrl: z.string().url(),
          thumbnailUrl: z.string().url().nullable().optional(),
          caption: z.string().nullable().optional(),
        })
        .strict()
    ),
  })
  .strict();

export type AddGalleryImagesInput = z.infer<typeof addGalleryImagesSchema>;

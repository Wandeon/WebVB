import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventBaseSchema = z
  .object({
    title: z
      .string()
      .min(2, 'Naslov mora imati najmanje 2 znaka')
      .max(200, 'Naslov može imati najviše 200 znakova'),
    description: z
      .string()
      .nullable()
      .optional()
      .transform((val) => val || null),
    eventDate: z.coerce.date({ message: 'Datum događanja je obavezan' }),
    eventTime: z
      .union([z.string().regex(timeRegex, 'Vrijeme mora biti u formatu HH:MM'), z.literal(''), z.null()])
      .transform((val) => (val ? val : null))
      .optional(),
    endDate: z.coerce
      .date()
      .nullable()
      .optional()
      .transform((val) => val || null),
    location: z
      .string()
      .max(200, 'Lokacija može imati najviše 200 znakova')
      .nullable()
      .optional()
      .transform((val) => val || null),
    posterImage: z
      .string()
      .url()
      .nullable()
      .optional()
      .transform((val) => val || null),
  })
  .strict();

export const eventSchema = eventBaseSchema.superRefine((data, ctx) => {
  if (data.endDate && data.eventDate && data.endDate < data.eventDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Završni datum ne može biti prije početnog datuma',
      path: ['endDate'],
    });
  }
});

export const createEventSchema = eventSchema;
export const updateEventSchema = eventBaseSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.endDate && data.eventDate && data.endDate < data.eventDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Završni datum ne može biti prije početnog datuma',
        path: ['endDate'],
      });
    }
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const eventQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().max(200).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    upcoming: z.coerce.boolean().optional(),
    sortBy: z.enum(['eventDate', 'createdAt', 'title']).default('eventDate'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict();

export type EventQueryInput = z.infer<typeof eventQuerySchema>;

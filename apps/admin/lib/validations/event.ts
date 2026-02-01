import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

const dateStringSchema = z
  .string()
  .regex(dateRegex, 'Datum mora biti u formatu GGGG-MM-DD')
  .refine(isValidDateString, { message: 'Nevažeći datum' });

const optionalDateStringSchema = z
  .union([dateStringSchema, z.literal(''), z.null()])
  .transform((value) => (value ? value : null))
  .optional();

const optionalTimeStringSchema = z
  .union([z.string().regex(timeRegex, 'Vrijeme mora biti u formatu HH:MM'), z.literal(''), z.null()])
  .transform((value) => (value ? value : null))
  .optional();

const eventFormBaseSchema = z
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
    eventDate: dateStringSchema,
    eventTime: optionalTimeStringSchema,
    endDate: optionalDateStringSchema,
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

export const eventFormSchema = eventFormBaseSchema.superRefine((data, ctx) => {
  if (data.endDate && data.eventDate && data.endDate < data.eventDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Završni datum ne može biti prije početnog datuma',
      path: ['endDate'],
    });
  }
});

export const createEventSchema = eventFormSchema;
export const updateEventSchema = eventFormBaseSchema
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
    search: z.string().optional(),
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional(),
    upcoming: z.coerce.boolean().optional(),
    sortBy: z.enum(['eventDate', 'createdAt', 'title']).default('eventDate'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict();

export type EventQueryInput = z.infer<typeof eventQuerySchema>;

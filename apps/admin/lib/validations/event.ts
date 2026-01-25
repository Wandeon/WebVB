import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(2, 'Naslov mora imati najmanje 2 znaka')
    .max(200, 'Naslov može imati najviše 200 znakova'),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  eventDate: z.string().min(1, 'Datum događanja je obavezan'),
  eventTime: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  endDate: z
    .string()
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
});

export const createEventSchema = eventFormSchema;
export const updateEventSchema = eventFormSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  upcoming: z.coerce.boolean().optional(),
  sortBy: z.enum(['eventDate', 'createdAt', 'title']).default('eventDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type EventQueryInput = z.infer<typeof eventQuerySchema>;

import { z } from 'zod';

import {
  sanitizeEmailString,
  sanitizeMultilineString,
  sanitizeSingleLineString,
} from './sanitize';

export const PROBLEM_TYPES = [
  { value: 'cesta', label: 'Ceste i prometnice' },
  { value: 'rasvjeta', label: 'Javna rasvjeta' },
  { value: 'otpad', label: 'Otpad i čistoća' },
  { value: 'komunalno', label: 'Komunalna infrastruktura' },
  { value: 'ostalo', label: 'Ostalo' },
] as const;

export const problemTypeValues = PROBLEM_TYPES.map((t) => t.value) as [string, ...string[]];

// Helper: sanitize then validate with additional constraints
const sanitizedString = (sanitize: (s: string) => string) =>
  z.string().transform(sanitize);

const sanitizedOptionalString = (sanitize: (s: string) => string) =>
  z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const sanitized = sanitize(val);
      return sanitized.length === 0 ? undefined : sanitized;
    });

export const contactFormSchema = z
  .object({
    name: sanitizedString(sanitizeSingleLineString).pipe(
      z.string().min(1, 'Ime je obavezno').max(100)
    ),
    email: sanitizedString(sanitizeEmailString).pipe(
      z.string().email('Unesite ispravnu email adresu')
    ),
    subject: sanitizedOptionalString(sanitizeSingleLineString).pipe(z.string().max(200).optional()),
    message: sanitizedString(sanitizeMultilineString).pipe(
      z.string().min(10, 'Poruka mora imati najmanje 10 znakova').max(5000)
    ),
    honeypot: z.string().max(0).optional(),
  })
  .strict();

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const problemReportSchema = z
  .object({
    problemType: z.enum(problemTypeValues, {
      message: 'Odaberite vrstu problema',
    }),
    location: sanitizedString(sanitizeSingleLineString).pipe(
      z.string().min(1, 'Lokacija je obavezna').max(500)
    ),
    description: sanitizedString(sanitizeMultilineString).pipe(
      z.string().min(10, 'Opis mora imati najmanje 10 znakova').max(5000)
    ),
    reporterName: sanitizedOptionalString(sanitizeSingleLineString).pipe(
      z.string().max(100).optional()
    ),
    reporterEmail: sanitizedOptionalString(sanitizeEmailString).pipe(
      z.string().email('Unesite ispravnu email adresu').optional()
    ),
    reporterPhone: sanitizedOptionalString(sanitizeSingleLineString).pipe(
      z
        .string()
        .max(20)
        .regex(/^[0-9+()\s-]+$/, 'Telefon smije sadržavati samo brojeve i znakove + ( ) -')
        .optional()
    ),
    images: z
      .array(
        z
          .object({
            url: z.string().url(),
            caption: sanitizedOptionalString(sanitizeSingleLineString).pipe(
              z.string().max(200).optional()
            ),
          })
          .strict()
      )
      .max(5, 'Maksimalno 5 slika')
      .optional(),
    honeypot: z.string().max(0).optional(),
  })
  .strict();

export type ProblemReportData = z.infer<typeof problemReportSchema>;

export const newsletterSubscribeSchema = z
  .object({
    email: sanitizedString(sanitizeEmailString).pipe(
      z.string().email('Unesite ispravnu email adresu')
    ),
    honeypot: z.string().max(0).optional(),
  })
  .strict();

export type NewsletterSubscribeData = z.infer<typeof newsletterSubscribeSchema>;

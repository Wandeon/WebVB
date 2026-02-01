import { z } from 'zod';

export const PROBLEM_TYPES = [
  { value: 'cesta', label: 'Ceste i prometnice' },
  { value: 'rasvjeta', label: 'Javna rasvjeta' },
  { value: 'otpad', label: 'Otpad i čistoća' },
  { value: 'komunalno', label: 'Komunalna infrastruktura' },
  { value: 'ostalo', label: 'Ostalo' },
] as const;

export const problemTypeValues = PROBLEM_TYPES.map((t) => t.value) as [string, ...string[]];

export const contactFormSchema = z
  .object({
    name: z.string().min(1, 'Ime je obavezno').max(100),
    email: z.string().email('Unesite ispravnu email adresu'),
    subject: z.string().max(200).optional(),
    message: z.string().min(10, 'Poruka mora imati najmanje 10 znakova').max(5000),
    honeypot: z.string().max(0).optional(),
  })
  .strict();

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const problemReportSchema = z
  .object({
    problemType: z.enum(problemTypeValues, {
      message: 'Odaberite vrstu problema',
    }),
    location: z.string().min(1, 'Lokacija je obavezna').max(500),
    description: z.string().min(10, 'Opis mora imati najmanje 10 znakova').max(5000),
    reporterName: z.string().max(100).optional(),
    reporterEmail: z.string().email('Unesite ispravnu email adresu').optional().or(z.literal('')),
    reporterPhone: z.string().max(20).optional(),
    images: z
      .array(
        z
          .object({
            url: z.string().url(),
            caption: z.string().max(200).optional(),
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
    email: z.string().email('Unesite ispravnu email adresu'),
    honeypot: z.string().max(0).optional(),
  })
  .strict();

export type NewsletterSubscribeData = z.infer<typeof newsletterSubscribeSchema>;

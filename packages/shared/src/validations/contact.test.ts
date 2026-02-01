import { describe, expect, it } from 'vitest';

import {
  contactFormSchema,
  PROBLEM_TYPES,
  problemReportSchema,
  problemTypeValues,
} from './contact';

describe('contactFormSchema', () => {
  it('accepts valid contact form data', () => {
    const validData = {
      name: 'Ivan Horvat',
      email: 'Ivan.Horvat@Example.com',
      subject: 'Upit o komunalnim uslugama',
      message: 'Zanima me kako mogu prijaviti problem s javnom rasvjetom u mom naselju.',
    };

    const result = contactFormSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Ivan Horvat');
      expect(result.data.email).toBe('ivan.horvat@example.com');
      expect(result.data.subject).toBe('Upit o komunalnim uslugama');
    }
  });

  it('accepts data with optional subject omitted', () => {
    const validData = {
      name: 'Ana Babic',
      email: 'ana@example.com',
      message: 'Ovo je poruka bez predmeta koja je dovoljno duga.',
    };

    const result = contactFormSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subject).toBeUndefined();
    }
  });

  it('rejects invalid email address', () => {
    const invalidData = {
      name: 'Test Korisnik',
      email: 'invalid-email',
      message: 'Ovo je testna poruka s najmanje deset znakova.',
    };

    const result = contactFormSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Unesite ispravnu email adresu');
    }
  });

  it('rejects empty name', () => {
    const invalidData = {
      name: '',
      email: 'test@example.com',
      message: 'Ovo je testna poruka s najmanje deset znakova.',
    };

    const result = contactFormSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Ime je obavezno');
    }
  });

  it('rejects message shorter than 10 characters', () => {
    const invalidData = {
      name: 'Test',
      email: 'test@example.com',
      message: 'Kratko',
    };

    const result = contactFormSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Poruka mora imati najmanje 10 znakova');
    }
  });

  it('accepts empty honeypot field', () => {
    const validData = {
      name: 'Test Korisnik',
      email: 'test@example.com',
      message: 'Ovo je testna poruka s najmanje deset znakova.',
      honeypot: '',
    };

    const result = contactFormSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('rejects honeypot field with content', () => {
    const invalidData = {
      name: 'Bot',
      email: 'bot@example.com',
      message: 'Ovo je spam poruka od bota.',
      honeypot: 'spam content',
    };

    const result = contactFormSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it('rejects unknown fields', () => {
    const result = contactFormSchema.safeParse({
      name: 'Ivan Horvat',
      email: 'ivan.horvat@example.com',
      message: 'Ovo je poruka s dovoljnim brojem znakova.',
      extra: 'nepoznato',
    });

    expect(result.success).toBe(false);
  });

  it('sanitizes contact input by stripping HTML and trimming', () => {
    const validData = {
      name: '  <b>Ivana</b>   Horvat ',
      email: '  IVANA@EXAMPLE.COM ',
      subject: ' <script>alert(1)</script> Upit ',
      message: '  <p>Pozdrav!</p>\nOvo je <strong>test</strong> poruka.  ',
    };

    const result = contactFormSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Ivana Horvat');
      expect(result.data.email).toBe('ivana@example.com');
      expect(result.data.subject).toBe('Upit');
      expect(result.data.message).toBe('Pozdrav!\nOvo je test poruka.');
    }
  });
});

describe('problemReportSchema', () => {
  it('accepts valid problem report data', () => {
    const validData = {
      problemType: 'cesta',
      location: 'Ulica kralja Tomislava 15',
      description: 'Oštećena prometnica s rupama na kolniku.',
    };

    const result = problemReportSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.problemType).toBe('cesta');
      expect(result.data.location).toBe('Ulica kralja Tomislava 15');
    }
  });

  it('accepts data with optional contact information', () => {
    const validData = {
      problemType: 'rasvjeta',
      location: 'Trg bana Jelacica',
      description: 'Javna rasvjeta ne radi vec tri dana.',
      reporterName: 'Marko Maric',
      reporterEmail: 'marko@example.com',
      reporterPhone: '+385 91 234 5678',
    };

    const result = problemReportSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reporterName).toBe('Marko Maric');
      expect(result.data.reporterEmail).toBe('marko@example.com');
      expect(result.data.reporterPhone).toBe('+385 91 234 5678');
    }
  });

  it('accepts data with images', () => {
    const validData = {
      problemType: 'otpad',
      location: 'Park u centru',
      description: 'Pretrpan kontejner za smece.',
      images: [
        { url: 'https://example.com/image1.jpg', caption: 'Slika kontejnera' },
        { url: 'https://example.com/image2.jpg' },
      ],
    };

    const result = problemReportSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success && result.data.images) {
      expect(result.data.images).toHaveLength(2);
      expect(result.data.images[0]?.caption).toBe('Slika kontejnera');
      expect(result.data.images[1]?.caption).toBeUndefined();
    }
  });

  it('rejects invalid problem type', () => {
    const invalidData = {
      problemType: 'invalid_type',
      location: 'Neka lokacija',
      description: 'Opis problema s najmanje deset znakova.',
    };

    const result = problemReportSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Odaberite vrstu problema');
    }
  });

  it('rejects unknown fields', () => {
    const result = problemReportSchema.safeParse({
      problemType: 'cesta',
      location: 'Ulica kralja Tomislava 15',
      description: 'Opis problema s najmanje deset znakova.',
      extra: 'nepoznato',
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than 5 images', () => {
    const invalidData = {
      problemType: 'komunalno',
      location: 'Lokacija',
      description: 'Opis problema s najmanje deset znakova.',
      images: [
        { url: 'https://example.com/image1.jpg' },
        { url: 'https://example.com/image2.jpg' },
        { url: 'https://example.com/image3.jpg' },
        { url: 'https://example.com/image4.jpg' },
        { url: 'https://example.com/image5.jpg' },
        { url: 'https://example.com/image6.jpg' },
      ],
    };

    const result = problemReportSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Maksimalno 5 slika');
    }
  });

  it('rejects empty location', () => {
    const invalidData = {
      problemType: 'ostalo',
      location: '',
      description: 'Opis problema s najmanje deset znakova.',
    };

    const result = problemReportSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Lokacija je obavezna');
    }
  });

  it('rejects short description', () => {
    const invalidData = {
      problemType: 'cesta',
      location: 'Neka ulica',
      description: 'Kratko',
    };

    const result = problemReportSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Opis mora imati najmanje 10 znakova');
    }
  });

  it('accepts empty string for optional email', () => {
    const validData = {
      problemType: 'rasvjeta',
      location: 'Ulica mira 5',
      description: 'Lampa ne radi vec tjedan dana.',
      reporterEmail: '',
    };

    const result = problemReportSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reporterEmail).toBeUndefined();
    }
  });

  it('rejects invalid email when provided', () => {
    const invalidData = {
      problemType: 'rasvjeta',
      location: 'Ulica mira 5',
      description: 'Lampa ne radi vec tjedan dana.',
      reporterEmail: 'invalid-email',
    };

    const result = problemReportSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Unesite ispravnu email adresu');
    }
  });

  it('rejects invalid reporter phone characters', () => {
    const invalidData = {
      problemType: 'komunalno',
      location: 'Ulica mira 5',
      description: 'Opis problema s najmanje deset znakova.',
      reporterPhone: '091/123-456',
    };

    const result = problemReportSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Telefon smije sadržavati samo brojeve i znakove + ( ) -'
      );
    }
  });

  it('sanitizes problem report content', () => {
    const validData = {
      problemType: 'otpad',
      location: '  <b>Centar</b> ',
      description: ' <p>Nepropisno</p>\n<em>odlozen</em> otpad. ',
      reporterName: '  <strong>Ana</strong>  ',
      reporterEmail: '  ANA@EXAMPLE.COM ',
      reporterPhone: '  +385 91 000 0000  ',
      images: [{ url: 'https://example.com/image.jpg', caption: ' <i>Kontejner</i> ' }],
    };

    const result = problemReportSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location).toBe('Centar');
      expect(result.data.description).toBe('Nepropisno\nodlozen otpad.');
      expect(result.data.reporterName).toBe('Ana');
      expect(result.data.reporterEmail).toBe('ana@example.com');
      expect(result.data.reporterPhone).toBe('+385 91 000 0000');
      expect(result.data.images?.[0]?.caption).toBe('Kontejner');
    }
  });

  it('accepts empty honeypot field', () => {
    const validData = {
      problemType: 'otpad',
      location: 'Centar grada',
      description: 'Problem s odvozom smeca.',
      honeypot: '',
    };

    const result = problemReportSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('rejects honeypot field with content', () => {
    const invalidData = {
      problemType: 'otpad',
      location: 'Centar grada',
      description: 'Spam prijava od bota.',
      honeypot: 'bot content',
    };

    const result = problemReportSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });
});

describe('PROBLEM_TYPES', () => {
  it('exports exactly 5 problem types', () => {
    expect(PROBLEM_TYPES).toHaveLength(5);
  });

  it('has correct values', () => {
    const values = PROBLEM_TYPES.map((t) => t.value);
    expect(values).toEqual(['cesta', 'rasvjeta', 'otpad', 'komunalno', 'ostalo']);
  });

  it('has correct labels in Croatian', () => {
    const labels = PROBLEM_TYPES.map((t) => t.label);
    expect(labels).toEqual([
      'Ceste i prometnice',
      'Javna rasvjeta',
      'Otpad i čistoća',
      'Komunalna infrastruktura',
      'Ostalo',
    ]);
  });

  it('problemTypeValues matches PROBLEM_TYPES values', () => {
    const expectedValues = PROBLEM_TYPES.map((t) => t.value);
    expect(problemTypeValues).toEqual(expectedValues);
  });
});

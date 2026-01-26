import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { problemReportsRepository } from './problem-reports';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    problemReport: {
      create: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  problemReport: {
    create: Mock;
  };
};

describe('problemReportsRepository.create', () => {
  beforeEach(() => {
    mockedDb.problemReport.create.mockReset();
  });

  it('defaults optional fields and uses null for missing images', async () => {
    mockedDb.problemReport.create.mockResolvedValue({ id: 'report-1' });

    await problemReportsRepository.create({
      problemType: 'cesta',
      location: 'Ulica 1',
      description: 'Opis problema.',
    });

    expect(mockedDb.problemReport.create).toHaveBeenCalledWith({
      data: {
        problemType: 'cesta',
        location: 'Ulica 1',
        description: 'Opis problema.',
        reporterName: null,
        reporterEmail: null,
        reporterPhone: null,
        images: null,
        status: 'new',
        ipAddress: null,
      },
    });
  });

  it('uses provided optional values', async () => {
    mockedDb.problemReport.create.mockResolvedValue({ id: 'report-2' });

    await problemReportsRepository.create({
      problemType: 'otpad',
      location: 'Ulica 2',
      description: 'Opis problema.',
      reporterName: 'Iva Example',
      reporterEmail: 'iva@example.com',
      reporterPhone: '091 000 0000',
      images: [{ url: 'https://example.com/image.jpg' }],
      status: 'in_progress',
      ipAddress: '127.0.0.1',
    });

    expect(mockedDb.problemReport.create).toHaveBeenCalledWith({
      data: {
        problemType: 'otpad',
        location: 'Ulica 2',
        description: 'Opis problema.',
        reporterName: 'Iva Example',
        reporterEmail: 'iva@example.com',
        reporterPhone: '091 000 0000',
        images: [{ url: 'https://example.com/image.jpg' }],
        status: 'in_progress',
        ipAddress: '127.0.0.1',
      },
    });
  });
});

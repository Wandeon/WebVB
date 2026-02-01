import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { problemReportsRepository } from './problem-reports';
import { db } from '../client';

vi.mock('../client', () => ({
  db: {
    problemReport: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  problemReport: {
    create: Mock;
    findFirst: Mock;
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
        images: Prisma.JsonNull,
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

describe('problemReportsRepository.findRecentDuplicate', () => {
  beforeEach(() => {
    mockedDb.problemReport.findFirst.mockReset();
  });

  it('returns null when no identifier provided', async () => {
    const result = await problemReportsRepository.findRecentDuplicate({
      problemType: 'cesta',
      location: 'Ulica 1',
      description: 'Opis problema.',
      windowMs: 10 * 60 * 1000,
    });

    expect(result).toBeNull();
    expect(mockedDb.problemReport.findFirst).not.toHaveBeenCalled();
  });

  it('queries recent duplicates by reporter email', async () => {
    mockedDb.problemReport.findFirst.mockResolvedValue({
      id: 'report-dup',
      images: null,
    });

    await problemReportsRepository.findRecentDuplicate({
      problemType: 'otpad',
      location: 'Ulica 2',
      description: 'Opis problema.',
      reporterEmail: 'iva@example.com',
      windowMs: 10 * 60 * 1000,
    });

    expect(mockedDb.problemReport.findFirst).toHaveBeenCalledWith({
      where: {
        problemType: 'otpad',
        location: 'Ulica 2',
        description: 'Opis problema.',
        createdAt: {
          gte: expect.any(Date),
        },
        reporterEmail: 'iva@example.com',
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});

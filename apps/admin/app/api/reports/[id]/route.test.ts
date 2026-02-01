import { describe, expect, it, vi } from 'vitest';

import { requireAuth } from '@/lib/api-auth';

import { DELETE } from './route';

import type { ProblemReportRecord } from '@repo/database';

vi.mock('@repo/database', () => ({
  problemReportsRepository: {
    findById: vi.fn(),
    deleteById: vi.fn(),
  },
}));

vi.mock('@/lib/api-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  problemReportsLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { problemReportsRepository } from '@repo/database';

const mockedRequireAuth = vi.mocked(requireAuth);
const mockedProblemReportsRepository = vi.mocked(problemReportsRepository);

const mockReport: ProblemReportRecord = {
  id: '7e6651a4-4c47-46c5-8d36-4b1d40f709e7',
  reporterName: 'Ana Horvat',
  reporterEmail: 'ana@example.com',
  reporterPhone: null,
  problemType: 'cesta',
  location: 'Glavna ulica 10',
  description: 'Oštećenje kolnika',
  images: null,
  status: 'new',
  resolutionNotes: null,
  resolvedAt: null,
  resolvedBy: null,
  ipAddress: '192.168.0.0',
  createdAt: new Date(),
};

describe('DELETE /api/reports/[id]', () => {
  it('deletes a report when authorized', async () => {
    mockedRequireAuth.mockResolvedValue({
      context: {
        session: { user: { id: 'admin-1', role: 'admin' } },
        role: 'admin',
        userId: 'admin-1',
      },
    });
    mockedProblemReportsRepository.findById.mockResolvedValue(mockReport);
    mockedProblemReportsRepository.deleteById.mockResolvedValue();

    const request = new Request('http://localhost/api/reports/7e6651a4-4c47-46c5-8d36-4b1d40f709e7', {
      method: 'DELETE',
    });
    const response = await DELETE(request as never, {
      params: Promise.resolve({ id: mockReport.id }),
    });
    const payload = (await response.json()) as { success: boolean; data?: { message?: string } };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.message).toBe('Prijava problema je trajno obrisana.');
  });

  it('returns not found when report does not exist', async () => {
    mockedRequireAuth.mockResolvedValue({
      context: {
        session: { user: { id: 'admin-1', role: 'admin' } },
        role: 'admin',
        userId: 'admin-1',
      },
    });
    mockedProblemReportsRepository.findById.mockResolvedValue(null);

    const request = new Request('http://localhost/api/reports/7e6651a4-4c47-46c5-8d36-4b1d40f709e7', {
      method: 'DELETE',
    });
    const response = await DELETE(request as never, {
      params: Promise.resolve({ id: mockReport.id }),
    });

    expect(response.status).toBe(404);
  });
});

import { Prisma } from '@prisma/client';

import { db } from '../client';

export interface ProblemReportImage {
  url: string;
  caption?: string | null;
}

export interface CreateProblemReportData {
  problemType: string;
  location: string;
  description: string;
  reporterName?: string | null;
  reporterEmail?: string | null;
  reporterPhone?: string | null;
  images?: ProblemReportImage[] | null;
  status?: string;
  ipAddress?: string | null;
}

export interface ProblemReportRecord {
  id: string;
  reporterName: string | null;
  reporterEmail: string | null;
  reporterPhone: string | null;
  problemType: string;
  location: string;
  description: string;
  images: ProblemReportImage[] | null;
  status: string;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export const problemReportsRepository = {
  async create(data: CreateProblemReportData): Promise<ProblemReportRecord> {
    const result = await db.problemReport.create({
      data: {
        problemType: data.problemType,
        location: data.location,
        description: data.description,
        reporterName: data.reporterName ?? null,
        reporterEmail: data.reporterEmail ?? null,
        reporterPhone: data.reporterPhone ?? null,
        images: data.images
          ? (data.images as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: data.status ?? 'new',
        ipAddress: data.ipAddress ?? null,
      },
    });

    return {
      ...result,
      images: result.images as ProblemReportImage[] | null,
    };
  },
};

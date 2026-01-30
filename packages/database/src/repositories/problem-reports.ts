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

export interface FindAllProblemReportsOptions {
  page?: number | undefined;
  limit?: number | undefined;
  status?: string | undefined;
  problemType?: string | undefined;
  search?: string | undefined;
  sortBy?: 'createdAt' | 'status' | 'problemType' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllProblemReportsResult {
  reports: ProblemReportRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CountProblemReportsOptions {
  status?: string;
  problemType?: string;
}

export type ProblemReportStatus = 'new' | 'in_progress' | 'resolved' | 'rejected';

export const problemReportsRepository = {
  /**
   * Create a new problem report
   */
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

  /**
   * Find all problem reports with filtering, pagination, and sorting
   */
  async findAll(
    options: FindAllProblemReportsOptions = {}
  ): Promise<FindAllProblemReportsResult> {
    const {
      page = 1,
      limit = 20,
      status,
      problemType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build where clause
    const where: Prisma.ProblemReportWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (problemType) {
      where.problemType = problemType;
    }

    if (search) {
      where.OR = [
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, reports] = await Promise.all([
      db.problemReport.count({ where }),
      db.problemReport.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      reports: reports.map((report) => ({
        ...report,
        images: report.images as ProblemReportImage[] | null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Find a single problem report by ID
   */
  async findById(id: string): Promise<ProblemReportRecord | null> {
    const result = await db.problemReport.findUnique({
      where: { id },
    });

    if (!result) {
      return null;
    }

    return {
      ...result,
      images: result.images as ProblemReportImage[] | null,
    };
  },

  /**
   * Update the status of a problem report
   * If status is 'resolved' or 'rejected', sets resolvedAt and resolvedBy
   */
  async updateStatus(
    id: string,
    status: ProblemReportStatus,
    userId?: string
  ): Promise<ProblemReportRecord> {
    // Build update data - use raw field updates to avoid relation complexity
    const updateData: Record<string, unknown> = {
      status,
    };

    // Set resolution fields for terminal states
    if (status === 'resolved' || status === 'rejected') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = userId ?? null;
    }

    const result = await db.problemReport.update({
      where: { id },
      data: updateData as Prisma.ProblemReportUpdateInput,
    });

    return {
      ...result,
      images: result.images as ProblemReportImage[] | null,
    };
  },

  /**
   * Add resolution notes to a problem report
   * Also sets resolvedAt and resolvedBy
   */
  async addResolutionNotes(
    id: string,
    notes: string,
    userId: string
  ): Promise<ProblemReportRecord> {
    const result = await db.problemReport.update({
      where: { id },
      data: {
        resolutionNotes: notes,
        resolvedAt: new Date(),
        resolvedBy: userId,
      } as Prisma.ProblemReportUpdateInput,
    });

    return {
      ...result,
      images: result.images as ProblemReportImage[] | null,
    };
  },

  /**
   * Count problem reports with optional filtering
   * Useful for dashboard statistics
   */
  async count(options: CountProblemReportsOptions = {}): Promise<number> {
    const { status, problemType } = options;

    const where: Prisma.ProblemReportWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (problemType) {
      where.problemType = problemType;
    }

    return db.problemReport.count({ where });
  },
};

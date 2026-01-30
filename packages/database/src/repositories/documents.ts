import { db } from '../client';

import type { Document, Prisma } from '@prisma/client';

export interface DocumentWithUploader extends Document {
  uploader: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface FindAllDocumentsOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  category?: string | undefined;
  year?: number | undefined;
  sortBy?: 'createdAt' | 'title' | 'year' | 'fileSize' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllDocumentsResult {
  documents: DocumentWithUploader[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateDocumentData {
  title: string;
  fileUrl: string;
  fileSize?: number | null;
  category: string;
  subcategory?: string | null;
  year?: number | null;
  uploadedBy?: string | null;
}

export interface UpdateDocumentData {
  title?: string;
  category?: string;
  subcategory?: string | null;
  year?: number | null;
}

const uploaderSelect = {
  id: true,
  name: true,
  email: true,
} as const;

export const documentsRepository = {
  /**
   * Find all documents with filtering, pagination, and sorting
   */
  async findAll(options: FindAllDocumentsOptions = {}): Promise<FindAllDocumentsResult> {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      year,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: Prisma.DocumentWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subcategory: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (year) {
      where.year = year;
    }

    const [total, documents] = await Promise.all([
      db.document.count({ where }),
      db.document.findMany({
        where,
        include: { uploader: { select: uploaderSelect } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Find a single document by ID
   */
  async findById(id: string): Promise<DocumentWithUploader | null> {
    return db.document.findUnique({
      where: { id },
      include: { uploader: { select: uploaderSelect } },
    });
  },

  /**
   * Create a new document
   */
  async create(data: CreateDocumentData): Promise<DocumentWithUploader> {
    return db.document.create({
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize ?? null,
        category: data.category,
        subcategory: data.subcategory ?? null,
        year: data.year ?? null,
        uploadedBy: data.uploadedBy ?? null,
      },
      include: { uploader: { select: uploaderSelect } },
    });
  },

  /**
   * Update an existing document
   */
  async update(id: string, data: UpdateDocumentData): Promise<DocumentWithUploader> {
    return db.document.update({
      where: { id },
      data,
      include: { uploader: { select: uploaderSelect } },
    });
  },

  /**
   * Delete a document
   */
  async delete(id: string): Promise<Document> {
    return db.document.delete({ where: { id } });
  },

  /**
   * Check if a document exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await db.document.count({ where: { id } });
    return count > 0;
  },

  /**
   * Get distinct years from documents for year filter dropdown
   */
  async getDistinctYears(): Promise<number[]> {
    const results = await db.document.findMany({
      where: { year: { not: null } },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });
    return results.map((r) => r.year!);
  },

  /**
   * Get document counts per category for sidebar badges
   */
  async getCategoryCounts(year?: number): Promise<Record<string, number>> {
    const results = await db.document.groupBy({
      by: ['category'],
      _count: { id: true },
      ...(typeof year === 'number' ? { where: { year } } : {}),
    });
    return Object.fromEntries(
      results.map((r) => [r.category, r._count.id])
    );
  },

  /**
   * Get latest documents (for homepage)
   */
  async getLatestDocuments(limit: number = 5): Promise<DocumentWithUploader[]> {
    return db.document.findMany({
      include: {
        uploader: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};

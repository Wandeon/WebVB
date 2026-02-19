import { db } from '../client';
import { clampLimit, normalizePagination } from './pagination';

import type { Document, Prisma } from '@prisma/client';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DISTINCT_YEARS_CACHE_TTL_MS = 5 * 60 * 1000;
const CATEGORY_COUNTS_CACHE_TTL_MS = 5 * 60 * 1000;
const CATEGORY_COUNTS_CACHE_MAX_ENTRIES = 12;

let distinctYearsCache: CacheEntry<number[]> | null = null;
const categoryCountsCache = new Map<string, CacheEntry<Record<string, number>>>();

function getDistinctYearsCache(): number[] | null {
  if (!distinctYearsCache) {
    return null;
  }

  if (distinctYearsCache.expiresAt <= Date.now()) {
    distinctYearsCache = null;
    return null;
  }

  return distinctYearsCache.value;
}

function getCategoryCountsCache(key: string): Record<string, number> | null {
  const entry = categoryCountsCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    categoryCountsCache.delete(key);
    return null;
  }

  return entry.value;
}

function setDistinctYearsCache(value: number[]): void {
  distinctYearsCache = {
    value,
    expiresAt: Date.now() + DISTINCT_YEARS_CACHE_TTL_MS,
  };
}

function setCategoryCountsCache(key: string, value: Record<string, number>): void {
  if (categoryCountsCache.has(key)) {
    categoryCountsCache.delete(key);
  }

  categoryCountsCache.set(key, {
    value,
    expiresAt: Date.now() + CATEGORY_COUNTS_CACHE_TTL_MS,
  });

  if (categoryCountsCache.size > CATEGORY_COUNTS_CACHE_MAX_ENTRIES) {
    const oldestKey = categoryCountsCache.keys().next().value;
    if (oldestKey) {
      categoryCountsCache.delete(oldestKey);
    }
  }
}

function clearDocumentCaches(): void {
  distinctYearsCache = null;
  categoryCountsCache.clear();
}

export function resetDocumentsCacheForTests(): void {
  clearDocumentCaches();
}

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
    const { page: safePage, limit: safeLimit } = normalizePagination({
      page,
      limit,
      defaultLimit: 20,
    });

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

    const total = await db.document.count({ where });
    const totalPages = Math.ceil(total / safeLimit);
    const clampedPage = Math.min(safePage, Math.max(totalPages, 1));
    const skip = (clampedPage - 1) * safeLimit;

    const documents = await db.document.findMany({
      where,
      include: { uploader: { select: uploaderSelect } },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: safeLimit,
    });

    return {
      documents,
      pagination: {
        page: clampedPage,
        limit: safeLimit,
        total,
        totalPages,
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
    const document = await db.document.create({
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

    clearDocumentCaches();

    return document;
  },

  /**
   * Update an existing document
   */
  async update(id: string, data: UpdateDocumentData): Promise<DocumentWithUploader> {
    const document = await db.document.update({
      where: { id },
      data,
      include: { uploader: { select: uploaderSelect } },
    });

    clearDocumentCaches();

    return document;
  },

  /**
   * Delete a document
   */
  async delete(id: string): Promise<Document> {
    const document = await db.document.delete({ where: { id } });

    clearDocumentCaches();

    return document;
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
    const cached = getDistinctYearsCache();
    if (cached) {
      return cached;
    }

    const results = await db.document.findMany({
      where: { year: { not: null } },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });
    const years = results.map((r) => r.year!);
    setDistinctYearsCache(years);
    return years;
  },

  /**
   * Get document counts per category for sidebar badges
   */
  async getCategoryCounts(year?: number): Promise<Record<string, number>> {
    const cacheKey = typeof year === 'number' ? String(year) : 'all';
    const cached = getCategoryCountsCache(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await db.document.groupBy({
      by: ['category'],
      _count: { id: true },
      ...(typeof year === 'number' ? { where: { year } } : {}),
    });
    const counts = Object.fromEntries(
      results.map((r) => [r.category, r._count.id])
    );
    setCategoryCountsCache(cacheKey, counts);
    return counts;
  },

  /**
   * Get latest documents (for homepage)
   */
  async getLatestDocuments(limit: number = 5): Promise<DocumentWithUploader[]> {
    const safeLimit = clampLimit(limit, 5);
    return db.document.findMany({
      include: {
        uploader: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
  },
};

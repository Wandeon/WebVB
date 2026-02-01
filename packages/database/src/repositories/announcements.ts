import { db } from '../client';
import { clampLimit, normalizePagination } from './pagination';

import type { Prisma, Announcement, AnnouncementAttachment } from '@prisma/client';

// Types for repository methods
export interface AnnouncementWithAuthor extends Announcement {
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  attachments: AnnouncementAttachment[];
}

export interface AnnouncementWithAttachmentCount extends Announcement {
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  _count: {
    attachments: number;
  };
}

export interface FindAllAnnouncementsOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  category?: string | undefined;
  status?: 'all' | 'draft' | 'published' | 'active' | 'expired' | undefined;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'publishedAt' | 'validUntil' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllAnnouncementsResult {
  announcements: AnnouncementWithAttachmentCount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAnnouncementData {
  title: string;
  slug: string;
  content?: string | null;
  excerpt?: string | null;
  category: string;
  validFrom?: Date | null;
  validUntil?: Date | null;
  publishedAt?: Date | null;
  authorId?: string | null;
}

export interface UpdateAnnouncementData {
  title?: string;
  slug?: string;
  content?: string | null;
  excerpt?: string | null;
  category?: string;
  validFrom?: Date | null;
  validUntil?: Date | null;
  publishedAt?: Date | null;
}

export interface AddAttachmentData {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType?: string;
  sortOrder?: number;
}

export interface FindPublishedAnnouncementsOptions {
  page?: number;
  limit?: number;
  category?: string;
  activeOnly?: boolean;
}

export interface FindPublishedAnnouncementsResult {
  announcements: AnnouncementWithAuthor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PublishedAnnouncementSitemapEntry {
  slug: string;
  updatedAt: Date;
  publishedAt: Date | null;
}

const authorSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

export const announcementsRepository = {
  /**
   * Find all announcements with filtering, pagination, and sorting
   */
  async findAll(options: FindAllAnnouncementsOptions = {}): Promise<FindAllAnnouncementsResult> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;
    const { page: safePage, limit: safeLimit, skip } = normalizePagination({
      page,
      limit,
      defaultLimit: 10,
    });

    const now = new Date();
    const where: Prisma.AnnouncementWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status === 'published') {
      where.publishedAt = { not: null };
    } else if (status === 'draft') {
      where.publishedAt = null;
    } else if (status === 'active') {
      where.publishedAt = { not: null };
      where.OR = [
        { validUntil: null },
        { validUntil: { gte: now } },
      ];
      where.AND = [
        {
          OR: [
            { validFrom: null },
            { validFrom: { lte: now } },
          ],
        },
      ];
    } else if (status === 'expired') {
      where.publishedAt = { not: null };
      where.validUntil = { lt: now };
    }

    const [total, announcements] = await Promise.all([
      db.announcement.count({ where }),
      db.announcement.findMany({
        where,
        include: {
          author: { select: authorSelect },
          _count: { select: { attachments: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: safeLimit,
      }),
    ]);

    return {
      announcements,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  /**
   * Find a single announcement by ID with all attachments
   */
  async findById(id: string): Promise<AnnouncementWithAuthor | null> {
    return db.announcement.findUnique({
      where: { id },
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  /**
   * Find an announcement by slug with all attachments
   */
  async findBySlug(slug: string): Promise<AnnouncementWithAuthor | null> {
    return db.announcement.findUnique({
      where: { slug },
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  /**
   * Check if a slug exists (optionally excluding a specific announcement)
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.AnnouncementWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await db.announcement.count({ where });
    return count > 0;
  },

  /**
   * Create a new announcement
   */
  async create(data: CreateAnnouncementData): Promise<AnnouncementWithAuthor> {
    return db.announcement.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content ?? null,
        excerpt: data.excerpt ?? null,
        category: data.category,
        validFrom: data.validFrom ?? null,
        validUntil: data.validUntil ?? null,
        publishedAt: data.publishedAt ?? null,
        authorId: data.authorId ?? null,
      },
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  /**
   * Update an existing announcement
   */
  async update(id: string, data: UpdateAnnouncementData): Promise<AnnouncementWithAuthor> {
    return db.announcement.update({
      where: { id },
      data,
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  /**
   * Delete an announcement (cascades to attachments)
   */
  async delete(id: string): Promise<void> {
    await db.announcement.delete({ where: { id } });
  },

  /**
   * Check if an announcement exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await db.announcement.count({ where: { id } });
    return count > 0;
  },

  /**
   * Add an attachment to an announcement
   */
  async addAttachment(
    announcementId: string,
    data: AddAttachmentData
  ): Promise<AnnouncementAttachment> {
    const maxOrder = await db.announcementAttachment.aggregate({
      where: { announcementId },
      _max: { sortOrder: true },
    });

    return db.announcementAttachment.create({
      data: {
        announcementId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType ?? 'application/pdf',
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });
  },

  /**
   * Remove an attachment
   */
  async removeAttachment(attachmentId: string): Promise<void> {
    await db.announcementAttachment.delete({ where: { id: attachmentId } });
  },

  /**
   * Get attachment by ID
   */
  async getAttachment(attachmentId: string): Promise<AnnouncementAttachment | null> {
    return db.announcementAttachment.findUnique({ where: { id: attachmentId } });
  },

  /**
   * Reorder attachments
   */
  async reorderAttachments(
    _announcementId: string,
    attachmentIds: string[]
  ): Promise<void> {
    await db.$transaction(
      attachmentIds.map((id, index) =>
        db.announcementAttachment.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
  },

  /**
   * Publish an announcement
   */
  async publish(id: string): Promise<AnnouncementWithAuthor> {
    return db.announcement.update({
      where: { id },
      data: { publishedAt: new Date() },
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  /**
   * Unpublish an announcement
   */
  async unpublish(id: string): Promise<AnnouncementWithAuthor> {
    return db.announcement.update({
      where: { id },
      data: { publishedAt: null },
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  /**
   * Find published announcements with pagination and optional category filtering
   * For public announcement listing pages
   */
  async findPublished(
    options: FindPublishedAnnouncementsOptions = {}
  ): Promise<FindPublishedAnnouncementsResult> {
    const { page = 1, limit = 12, category, activeOnly = true } = options;
    const { page: safePage, limit: safeLimit } = normalizePagination({
      page,
      limit,
      defaultLimit: 12,
    });
    const now = new Date();

    const where: Prisma.AnnouncementWhereInput = {
      publishedAt: { not: null },
    };

    if (category) {
      where.category = category;
    }

    if (activeOnly) {
      where.OR = [
        { validUntil: null },
        { validUntil: { gte: now } },
      ];
    }

    const total = await db.announcement.count({ where });
    const totalPages = Math.ceil(total / safeLimit);
    const clampedPage = totalPages > 0 ? Math.min(safePage, totalPages) : 1;
    const announcements = await db.announcement.findMany({
      where,
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (clampedPage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      announcements,
      pagination: {
        page: clampedPage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Find all published announcements for sitemap generation
   */
  async findPublishedForSitemap(): Promise<PublishedAnnouncementSitemapEntry[]> {
    return db.announcement.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
  },

  /**
   * Get latest active announcements (for homepage or sidebar)
   */
  async getLatestActive(limit: number = 5): Promise<AnnouncementWithAuthor[]> {
    const safeLimit = clampLimit(limit, 5);
    const now = new Date();

    return db.announcement.findMany({
      where: {
        publishedAt: { not: null },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { publishedAt: 'desc' },
      take: safeLimit,
    });
  },

  /**
   * Get related announcements from same category, excluding current announcement
   */
  async getRelatedAnnouncements(
    excludeId: string,
    category: string,
    limit: number = 3
  ): Promise<AnnouncementWithAuthor[]> {
    const safeLimit = clampLimit(limit, 3);
    const now = new Date();

    return db.announcement.findMany({
      where: {
        id: { not: excludeId },
        category,
        publishedAt: { not: null },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      include: {
        author: { select: authorSelect },
        attachments: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { publishedAt: 'desc' },
      take: safeLimit,
    });
  },
};

import { isValidPageSlug } from '@repo/shared';

import { db } from '../client';
import { normalizePagination } from './pagination';

import type { Prisma, Page } from '@prisma/client';

export interface PageWithRelations extends Page {
  parent: {
    id: string;
    title: string;
    slug: string;
  } | null;
  children: {
    id: string;
    title: string;
    slug: string;
    menuOrder: number;
  }[];
}

export interface FindAllPagesOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  parentId?: string | null | undefined;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'menuOrder' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllPagesResult {
  pages: PageWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PageSitemapEntry {
  slug: string;
  updatedAt: Date;
}

export interface CreatePageData {
  title: string;
  slug: string;
  content: string;
  parentId?: string | null;
  menuOrder?: number;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  content?: string;
  parentId?: string | null;
  menuOrder?: number;
}

const relationsSelect = {
  parent: {
    select: { id: true, title: true, slug: true },
  },
  children: {
    select: { id: true, title: true, slug: true, menuOrder: true },
    orderBy: { menuOrder: 'asc' as const },
  },
} as const;

export const pagesRepository = {
  async findAll(options: FindAllPagesOptions = {}): Promise<FindAllPagesResult> {
    const {
      page = 1,
      limit = 20,
      search,
      parentId,
      sortBy = 'menuOrder',
      sortOrder = 'asc',
    } = options;
    const { page: safePage, limit: safeLimit, skip } = normalizePagination({
      page,
      limit,
      defaultLimit: 20,
    });

    const where: Prisma.PageWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by parentId (null for top-level pages)
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const [total, pages] = await Promise.all([
      db.page.count({ where }),
      db.page.findMany({
        where,
        include: relationsSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: safeLimit,
      }),
    ]);

    return {
      pages,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  async findById(id: string): Promise<PageWithRelations | null> {
    return db.page.findUnique({
      where: { id },
      include: relationsSelect,
    });
  },

  async findBySlug(slug: string): Promise<PageWithRelations | null> {
    if (!isValidPageSlug(slug)) {
      return null;
    }

    return db.page.findUnique({
      where: { slug },
      include: relationsSelect,
    });
  },

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.PageWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await db.page.count({ where });
    return count > 0;
  },

  async create(data: CreatePageData): Promise<PageWithRelations> {
    return db.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        parentId: data.parentId ?? null,
        menuOrder: data.menuOrder ?? 0,
      },
      include: relationsSelect,
    });
  },

  async update(id: string, data: UpdatePageData): Promise<PageWithRelations> {
    return db.page.update({
      where: { id },
      data,
      include: relationsSelect,
    });
  },

  async delete(id: string): Promise<void> {
    await db.page.delete({ where: { id } });
  },

  /**
   * Reassign all children of a parent to a new parent (prevents orphaned pages on delete)
   */
  async reassignChildren(parentId: string, newParentId: string | null): Promise<void> {
    await db.page.updateMany({
      where: { parentId },
      data: { parentId: newParentId },
    });
  },

  async exists(id: string): Promise<boolean> {
    const count = await db.page.count({ where: { id } });
    return count > 0;
  },

  async findAllForParentSelect(excludeId?: string): Promise<Pick<Page, 'id' | 'title' | 'parentId'>[]> {
    const where: Prisma.PageWhereInput = {};

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return db.page.findMany({
      where,
      select: { id: true, title: true, parentId: true },
      orderBy: [{ menuOrder: 'asc' }, { title: 'asc' }],
    });
  },

  async findPublished(): Promise<Pick<Page, 'id' | 'slug' | 'title' | 'menuOrder'>[]> {
    return db.page.findMany({
      select: { id: true, slug: true, title: true, menuOrder: true },
      orderBy: { menuOrder: 'asc' },
    });
  },

  async findPublishedForSitemap(): Promise<PageSitemapEntry[]> {
    return db.page.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findBySlugPrefix(prefix: string): Promise<Pick<Page, 'id' | 'slug' | 'title' | 'content'>[]> {
    return db.page.findMany({
      where: {
        slug: {
          startsWith: prefix + '/',
        },
      },
      select: { id: true, slug: true, title: true, content: true },
      orderBy: { menuOrder: 'asc' },
    });
  },

  async findSiblingsBySlug(slug: string): Promise<Pick<Page, 'id' | 'slug' | 'title' | 'menuOrder'>[]> {
    if (!isValidPageSlug(slug)) {
      return [];
    }

    const hasSlash = slug.includes('/');

    if (!hasSlash) {
      // Root page: return all pages without "/" in slug
      return db.page.findMany({
        where: {
          NOT: {
            slug: {
              contains: '/',
            },
          },
        },
        select: { id: true, slug: true, title: true, menuOrder: true },
        orderBy: { menuOrder: 'asc' },
      });
    }

    // Child page: return pages with same parent prefix and same depth
    const segments = slug.split('/');
    const parentPrefix = segments.slice(0, -1).join('/') + '/';
    const depth = segments.length;

    // Get all pages starting with parent prefix
    const allSiblings = await db.page.findMany({
      where: {
        slug: {
          startsWith: parentPrefix,
        },
      },
      select: { id: true, slug: true, title: true, menuOrder: true },
      orderBy: { menuOrder: 'asc' },
    });

    // Filter to only include pages at the same depth
    return allSiblings.filter((page) => page.slug.split('/').length === depth);
  },
};

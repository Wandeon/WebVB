import { db } from '../client';
import { clampLimit, normalizePagination } from './pagination';

import type { Gallery, GalleryImage, Prisma } from '@prisma/client';

export interface GalleryWithImages extends Gallery {
  images: GalleryImage[];
  _count: { images: number };
}

export interface GalleryWithCount extends Gallery {
  _count: { images: number };
}

export interface FindAllGalleriesOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  sortBy?: 'createdAt' | 'eventDate' | 'name' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllGalleriesResult {
  galleries: GalleryWithCount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GallerySitemapEntry {
  slug: string;
  createdAt: Date;
}

export interface CreateGalleryData {
  name: string;
  slug: string;
  description?: string | null;
  eventDate?: Date | null;
  coverImage?: string | null;
}

export interface UpdateGalleryData {
  name?: string;
  slug?: string;
  description?: string | null;
  eventDate?: Date | null;
  coverImage?: string | null;
}

export interface AddImageData {
  imageUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
}

export const galleriesRepository = {
  async findAll(options: FindAllGalleriesOptions = {}): Promise<FindAllGalleriesResult> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;
    const { page: safePage, limit: safeLimit, skip } = normalizePagination({
      page,
      limit,
      defaultLimit: 20,
    });

    const where: Prisma.GalleryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, galleries] = await Promise.all([
      db.gallery.count({ where }),
      db.gallery.findMany({
        where,
        include: { _count: { select: { images: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: safeLimit,
      }),
    ]);

    return {
      galleries,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  async findById(id: string): Promise<GalleryWithImages | null> {
    return db.gallery.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { images: true } },
      },
    });
  },

  async findBySlug(slug: string): Promise<GalleryWithImages | null> {
    return db.gallery.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { images: true } },
      },
    });
  },

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.GalleryWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await db.gallery.count({ where });
    return count > 0;
  },

  async create(data: CreateGalleryData): Promise<GalleryWithImages> {
    return db.gallery.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        eventDate: data.eventDate ?? null,
        coverImage: data.coverImage ?? null,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { images: true } },
      },
    });
  },

  async update(id: string, data: UpdateGalleryData): Promise<GalleryWithImages> {
    return db.gallery.update({
      where: { id },
      data,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { images: true } },
      },
    });
  },

  async delete(id: string): Promise<Gallery> {
    return db.gallery.delete({ where: { id } });
  },

  async exists(id: string): Promise<boolean> {
    const count = await db.gallery.count({ where: { id } });
    return count > 0;
  },

  async addImages(galleryId: string, images: AddImageData[]): Promise<GalleryImage[]> {
    const maxOrder = await db.galleryImage.aggregate({
      where: { galleryId },
      _max: { sortOrder: true },
    });
    const startOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await db.$transaction(
      images.map((img, index) =>
        db.galleryImage.create({
          data: {
            galleryId,
            imageUrl: img.imageUrl,
            thumbnailUrl: img.thumbnailUrl ?? null,
            caption: img.caption ?? null,
            sortOrder: startOrder + index,
          },
        })
      )
    );

    return created;
  },

  async updateImageCaption(imageId: string, caption: string | null): Promise<GalleryImage> {
    return db.galleryImage.update({
      where: { id: imageId },
      data: { caption },
    });
  },

  async deleteImage(imageId: string): Promise<GalleryImage> {
    return db.galleryImage.delete({ where: { id: imageId } });
  },

  async reorderImages(_galleryId: string, imageIds: string[]): Promise<void> {
    await db.$transaction(
      imageIds.map((id, index) =>
        db.galleryImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
  },

  async getImageById(imageId: string): Promise<GalleryImage | null> {
    return db.galleryImage.findUnique({ where: { id: imageId } });
  },

  async findPublished(options: { page?: number; limit?: number } = {}): Promise<FindAllGalleriesResult> {
    const { page = 1, limit = 12 } = options;
    const { page: safePage, limit: safeLimit } = normalizePagination({
      page,
      limit,
      defaultLimit: 12,
    });
    const where: Prisma.GalleryWhereInput = { images: { some: {} } };

    const total = await db.gallery.count({ where });
    const totalPages = Math.ceil(total / safeLimit);
    const clampedPage = totalPages > 0 ? Math.min(safePage, totalPages) : 1;
    const galleries = await db.gallery.findMany({
      where,
      include: { _count: { select: { images: true } } },
      orderBy: { eventDate: 'desc' },
      skip: (clampedPage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      galleries,
      pagination: {
        page: clampedPage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Get gallery slugs for sitemap generation
   */
  async findAllForSitemap(): Promise<GallerySitemapEntry[]> {
    return db.gallery.findMany({
      select: { slug: true, createdAt: true },
      orderBy: { eventDate: 'desc' },
    });
  },

  /**
   * Get featured galleries for homepage showcase (galleries with cover images)
   */
  async getFeaturedForHomepage(limit: number = 12): Promise<GalleryWithCount[]> {
    const safeLimit = clampLimit(limit, 12);
    return db.gallery.findMany({
      where: {
        coverImage: { not: null },
        images: { some: {} },
      },
      include: { _count: { select: { images: true } } },
      orderBy: { eventDate: 'desc' },
      take: safeLimit,
    });
  },
};

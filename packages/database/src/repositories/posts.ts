import { db } from '../client';

import type { Prisma, Post } from '@prisma/client';

// Types for repository methods
export interface PostWithAuthor extends Post {
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

export interface FindAllPostsOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  category?: string | undefined;
  status?: 'all' | 'draft' | 'published' | undefined;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'publishedAt' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllPostsResult {
  posts: PostWithAuthor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  category: string;
  isFeatured: boolean;
  publishedAt?: Date | null;
  authorId?: string | null;
  featuredImage?: string | null;
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  category?: string;
  isFeatured?: boolean;
  publishedAt?: Date | null;
  featuredImage?: string | null;
}

const authorSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

export const postsRepository = {
  /**
   * Find all posts with filtering, pagination, and sorting
   */
  async findAll(options: FindAllPostsOptions = {}): Promise<FindAllPostsResult> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build where clause
    const where: Prisma.PostWhereInput = {};

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
    }

    const [total, posts] = await Promise.all([
      db.post.count({ where }),
      db.post.findMany({
        where,
        include: { author: { select: authorSelect } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Find a single post by ID
   */
  async findById(id: string): Promise<PostWithAuthor | null> {
    return db.post.findUnique({
      where: { id },
      include: { author: { select: authorSelect } },
    });
  },

  /**
   * Find a post by slug
   */
  async findBySlug(slug: string): Promise<PostWithAuthor | null> {
    return db.post.findUnique({
      where: { slug },
      include: { author: { select: authorSelect } },
    });
  },

  /**
   * Check if a slug exists (optionally excluding a specific post)
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.PostWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await db.post.count({ where });
    return count > 0;
  },

  /**
   * Create a new post
   */
  async create(data: CreatePostData): Promise<PostWithAuthor> {
    return db.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt ?? null,
        category: data.category,
        isFeatured: data.isFeatured,
        publishedAt: data.publishedAt ?? null,
        authorId: data.authorId ?? null,
        featuredImage: data.featuredImage ?? null,
      },
      include: { author: { select: authorSelect } },
    });
  },

  /**
   * Update an existing post
   */
  async update(id: string, data: UpdatePostData): Promise<PostWithAuthor> {
    return db.post.update({
      where: { id },
      data,
      include: { author: { select: authorSelect } },
    });
  },

  /**
   * Delete a post
   */
  async delete(id: string): Promise<void> {
    await db.post.delete({ where: { id } });
  },

  /**
   * Check if a post exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await db.post.count({ where: { id } });
    return count > 0;
  },

  /**
   * Get the latest featured published post
   */
  async getFeaturedPost(): Promise<PostWithAuthor | null> {
    return db.post.findFirst({
      where: {
        isFeatured: true,
        publishedAt: { not: null },
      },
      include: { author: { select: authorSelect } },
      orderBy: { publishedAt: 'desc' },
    });
  },

  /**
   * Get latest published posts (optionally excluding featured)
   */
  async getLatestPosts(
    limit: number = 4,
    excludeFeatured: boolean = true
  ): Promise<PostWithAuthor[]> {
    const where: Prisma.PostWhereInput = {
      publishedAt: { not: null },
    };

    if (excludeFeatured) {
      where.isFeatured = false;
    }

    return db.post.findMany({
      where,
      include: { author: { select: authorSelect } },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  },
};

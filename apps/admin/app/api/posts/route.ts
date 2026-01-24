import { db } from '@repo/database';
import { NextResponse } from 'next/server';

import { generateSlug } from '@/lib/utils/slug';
import { createPostSchema, postQuerySchema } from '@/lib/validations/post';

import type { Prisma } from '@repo/database';
import type { NextRequest } from 'next/server';

// GET /api/posts - List posts with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const queryResult = postQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      status: searchParams.get('status'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Nevaljani parametri upita' },
        { status: 400 }
      );
    }

    const { page, limit, search, category, status, sortBy, sortOrder } =
      queryResult.data;

    // Build where clause
    const where: Prisma.PostWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Status filter
    if (status === 'published') {
      where.publishedAt = { not: null };
    } else if (status === 'draft') {
      where.publishedAt = null;
    }

    // Get total count
    const total = await db.post.count({ where });

    // Get posts with pagination and sorting
    const posts = await db.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Greska prilikom dohvacanja objava' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Validate request body
    const validationResult = createPostSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { title, content, excerpt, category, isFeatured, publishedAt } =
      validationResult.data;

    // Generate unique slug
    let slug = generateSlug(title);
    let slugSuffix = 1;

    // Check for existing slug and make it unique
    while (await db.post.findUnique({ where: { slug } })) {
      slug = `${generateSlug(title)}-${slugSuffix}`;
      slugSuffix++;
    }

    // Create post
    const post = await db.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt ?? null,
        category,
        isFeatured,
        publishedAt: publishedAt ?? null,
        // authorId would be set from session in a real implementation
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Greska prilikom stvaranja objave' },
      { status: 500 }
    );
  }
}

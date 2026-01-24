import { db } from '@repo/database';
import { NextResponse } from 'next/server';

import { generateSlug } from '@/lib/utils/slug';
import { updatePostSchema } from '@/lib/validations/post';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id] - Get single post by ID
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const post = await db.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: 'Objava nije pronadena' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Greska prilikom dohvacanja objave' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();

    // Validate request body
    const validationResult = updatePostSchema.safeParse({
      ...(body as Record<string, unknown>),
      id,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await db.post.findUnique({ where: { id } });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Objava nije pronadena' },
        { status: 404 }
      );
    }

    const { title, content, excerpt, category, isFeatured, publishedAt } =
      validationResult.data;

    // Prepare update data
    const updateData: Parameters<typeof db.post.update>[0]['data'] = {};

    if (title !== undefined) {
      updateData.title = title;

      // Regenerate slug if title changed
      if (title !== existingPost.title) {
        let slug = generateSlug(title);
        let slugSuffix = 1;

        // Check for existing slug (excluding current post) and make it unique
        while (
          await db.post.findFirst({
            where: { slug, id: { not: id } },
          })
        ) {
          slug = `${generateSlug(title)}-${slugSuffix}`;
          slugSuffix++;
        }
        updateData.slug = slug;
      }
    }

    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt;

    // Update post
    const post = await db.post.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Greska prilikom azuriranja objave' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if post exists
    const existingPost = await db.post.findUnique({ where: { id } });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Objava nije pronadena' },
        { status: 404 }
      );
    }

    // Delete post
    await db.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Greska prilikom brisanja objave' },
      { status: 500 }
    );
  }
}

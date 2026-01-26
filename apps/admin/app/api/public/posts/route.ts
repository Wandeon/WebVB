import { postsRepository } from '@repo/database';
import { NextResponse } from 'next/server';

import { corsResponse, getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return corsResponse(request);
}

// GET /api/public/posts - Public posts list for web app
export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category') || undefined;
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10) || 12)) : 12;

  try {
    const { posts, pagination } = await postsRepository.findPublished({
      page,
      limit,
      ...(category && { category }),
    });

    // Get featured post only for first page without category filter
    let featuredPost = null;
    if (page === 1 && !category) {
      featuredPost = await postsRepository.getFeaturedPost();
    }

    const response = {
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        slug: p.slug,
        category: p.category,
        featuredImage: p.featuredImage,
        publishedAt: p.publishedAt?.toISOString() ?? null,
      })),
      pagination,
      featuredPost: featuredPost
        ? {
            id: featuredPost.id,
            title: featuredPost.title,
            excerpt: featuredPost.excerpt,
            slug: featuredPost.slug,
            category: featuredPost.category,
            featuredImage: featuredPost.featuredImage,
            publishedAt: featuredPost.publishedAt?.toISOString() ?? null,
          }
        : null,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching public posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500, headers: corsHeaders }
    );
  }
}

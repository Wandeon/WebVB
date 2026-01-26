// apps/admin/app/api/public/posts/route.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

import type { PostWithAuthor } from '@repo/database';

interface PostsResponse {
  success: boolean;
  data?: {
    posts: Array<{ id: string }>;
    featuredPost: { id: string } | null;
  };
  error?: {
    message: string;
  };
}

vi.mock('@repo/database', () => ({
  postsRepository: {
    findPublished: vi.fn(),
    getFeaturedPost: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  postsLogger: {
    error: vi.fn(),
  },
}));

// eslint-disable-next-line import/order -- Must be after vi.mock calls
import { postsRepository } from '@repo/database';

const mockedPostsRepository = vi.mocked(postsRepository);

describe('Public Posts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns published posts with featured post for first page', async () => {
    const mockPost = {
      id: 'post-1',
      title: 'Vijest',
      excerpt: 'Sažetak',
      slug: 'vijest',
      category: 'aktualnosti',
      featuredImage: null,
      images: null,
      publishedAt: new Date('2026-01-01'),
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
      content: '<p>Test</p>',
      isFeatured: false,
      facebookPostId: null,
      authorId: null,
      author: null,
    } satisfies PostWithAuthor;

    mockedPostsRepository.findPublished.mockResolvedValue({
      posts: [mockPost],
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
    mockedPostsRepository.getFeaturedPost.mockResolvedValue(mockPost);

    const response = await GET(
      new Request('http://localhost/api/public/posts') as never
    );
    const data = (await response.json()) as PostsResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    if (!data.data) {
      throw new Error('Missing response data');
    }
    expect(data.data.posts).toHaveLength(1);
    expect(data.data.featuredPost).toBeTruthy();
  });

  it('omits featured post when filtering by category', async () => {
    mockedPostsRepository.findPublished.mockResolvedValue({
      posts: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    });

    const response = await GET(
      new Request('http://localhost/api/public/posts?category=aktualnosti') as never
    );
    const data = (await response.json()) as PostsResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Mock is safe to assert.
    expect(mockedPostsRepository.getFeaturedPost).not.toHaveBeenCalled();
  });

  it('returns validation error for invalid params', async () => {
    const response = await GET(
      new Request('http://localhost/api/public/posts?page=0') as never
    );
    const data = (await response.json()) as PostsResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

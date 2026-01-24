import { describe, expect, it } from 'vitest';

import {
  createPostSchema,
  postQuerySchema,
  postSchema,
  updatePostSchema,
} from './post';

describe('postSchema', () => {
  it('validates a valid post', () => {
    const validPost = {
      title: 'Test naslov',
      content: 'Test sadržaj',
      category: 'aktualnosti',
      isFeatured: false,
    };

    const result = postSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it('rejects title shorter than 3 characters', () => {
    const invalidPost = {
      title: 'AB',
      content: 'Test sadržaj',
      category: 'aktualnosti',
      isFeatured: false,
    };

    const result = postSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Naslov mora imati najmanje 3 znaka'
      );
    }
  });

  it('rejects title longer than 200 characters', () => {
    const invalidPost = {
      title: 'A'.repeat(201),
      content: 'Test sadržaj',
      category: 'aktualnosti',
      isFeatured: false,
    };

    const result = postSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Naslov može imati najviše 200 znakova'
      );
    }
  });

  it('rejects empty content', () => {
    const invalidPost = {
      title: 'Test naslov',
      content: '',
      category: 'aktualnosti',
      isFeatured: false,
    };

    const result = postSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Sadržaj je obavezan');
    }
  });

  it('rejects invalid category', () => {
    const invalidPost = {
      title: 'Test naslov',
      content: 'Test sadržaj',
      category: 'invalid-category',
      isFeatured: false,
    };

    const result = postSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
  });

  it('accepts valid categories', () => {
    const categories = [
      'aktualnosti',
      'gospodarstvo',
      'sport',
      'komunalno',
      'kultura',
      'obrazovanje',
      'ostalo',
    ];

    for (const category of categories) {
      const post = {
        title: 'Test naslov',
        content: 'Test sadržaj',
        category,
        isFeatured: false,
      };

      const result = postSchema.safeParse(post);
      expect(result.success).toBe(true);
    }
  });

  it('accepts optional excerpt', () => {
    const postWithExcerpt = {
      title: 'Test naslov',
      content: 'Test sadržaj',
      category: 'aktualnosti',
      isFeatured: false,
      excerpt: 'Kratki sažetak',
    };

    const result = postSchema.safeParse(postWithExcerpt);
    expect(result.success).toBe(true);
  });

  it('rejects excerpt longer than 500 characters', () => {
    const invalidPost = {
      title: 'Test naslov',
      content: 'Test sadržaj',
      category: 'aktualnosti',
      isFeatured: false,
      excerpt: 'A'.repeat(501),
    };

    const result = postSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Sažetak može imati najviše 500 znakova'
      );
    }
  });
});

describe('createPostSchema', () => {
  it('is the same as postSchema', () => {
    const validPost = {
      title: 'Test naslov',
      content: 'Test sadržaj',
      category: 'aktualnosti',
      isFeatured: false,
    };

    const result = createPostSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });
});

describe('updatePostSchema', () => {
  it('requires id as UUID', () => {
    const validUpdate = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Updated title',
    };

    const result = updatePostSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    const invalidUpdate = {
      id: 'not-a-uuid',
      title: 'Updated title',
    };

    const result = updatePostSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it('allows partial updates', () => {
    const partialUpdate = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Only title updated',
    };

    const result = updatePostSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });
});

describe('postQuerySchema', () => {
  it('provides default values', () => {
    const result = postQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(result.data.status).toBe('all');
      expect(result.data.sortBy).toBe('createdAt');
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('coerces string page to number', () => {
    const result = postQuerySchema.safeParse({ page: '5' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
    }
  });

  it('rejects page less than 1', () => {
    const result = postQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects limit greater than 100', () => {
    const result = postQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('accepts valid status values', () => {
    for (const status of ['all', 'draft', 'published']) {
      const result = postQuerySchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('accepts valid sortBy values', () => {
    for (const sortBy of ['createdAt', 'updatedAt', 'title', 'publishedAt']) {
      const result = postQuerySchema.safeParse({ sortBy });
      expect(result.success).toBe(true);
    }
  });
});

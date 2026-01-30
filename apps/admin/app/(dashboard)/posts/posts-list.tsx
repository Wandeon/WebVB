'use client';

import { Button, toast } from '@repo/ui';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataTable,
  DeleteDialog,
  getColumns,
  type Post,
} from '@/components/posts';

import type { PaginationState } from '@tanstack/react-table';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PostsApiResponse {
  success: true;
  data: {
    posts: Post[];
    pagination: PaginationData;
  };
}

export function PostsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePost, setDeletePost] = useState<Post | null>(null);

  // Pagination state for DataTable
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: 10,
    }),
    [page]
  );

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`/posts?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Filter handlers - reset to page 1 when filters change
  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ search: value, page: '1' });
    },
    [updateParams]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateParams({ category: value, page: '1' });
    },
    [updateParams]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      updateParams({ status: value, page: '1' });
    },
    [updateParams]
  );

  const handleResetFilters = useCallback(() => {
    router.push('/posts');
  }, [router]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      updateParams({ page: String(newPagination.pageIndex + 1) });
    },
    [updateParams]
  );

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');

      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (status) params.set('status', status);

      const response = await fetch(`/api/posts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const response_data = (await response.json()) as PostsApiResponse;
      setPosts(response_data.data.posts);
      setPageCount(response_data.data.pagination.totalPages);
    } catch {
      toast({
        title: 'Greška',
        description: 'Došlo je do greške prilikom učitavanja objava.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, status]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  // Delete handler
  const handleDelete = useCallback((post: Post) => {
    setDeletePost(post);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    void fetchPosts();
  }, [fetchPosts]);

  // Add to newsletter
  const handleAddToNewsletter = useCallback(async (post: Post) => {
    try {
      const response = await fetch('/api/newsletter/draft/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'post', id: post.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to newsletter');
      }

      toast({
        title: 'Dodano u newsletter',
        description: `"${post.title}" je dodano u newsletter.`,
      });
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće dodati u newsletter.',
        variant: 'destructive',
      });
    }
  }, []);

  // Columns
  const columns = useMemo(
    () => getColumns({ onDelete: handleDelete, onAddToNewsletter: handleAddToNewsletter }),
    [handleDelete, handleAddToNewsletter]
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <Button asChild>
          <Link href="/posts/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nova objava
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={posts}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        search={search}
        category={category}
        status={status}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onStatusChange={handleStatusChange}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
      />

      {deletePost && (
        <DeleteDialog
          postId={deletePost.id}
          postTitle={deletePost.title}
          open={deletePost !== null}
          onOpenChange={(open) => {
            if (!open) setDeletePost(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

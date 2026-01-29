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
  type Announcement,
} from '@/components/announcements';

import type { PaginationState } from '@tanstack/react-table';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AnnouncementsApiResponse {
  success: true;
  data: {
    announcements: Announcement[];
    pagination: PaginationData;
  };
}

export function AnnouncementsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteAnnouncement, setDeleteAnnouncement] =
    useState<Announcement | null>(null);

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

      router.push(`/announcements?${params.toString()}`);
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
    router.push('/announcements');
  }, [router]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      updateParams({ page: String(newPagination.pageIndex + 1) });
    },
    [updateParams]
  );

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');

      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (status) params.set('status', status);

      const response = await fetch(`/api/announcements?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const response_data =
        (await response.json()) as AnnouncementsApiResponse;
      setAnnouncements(response_data.data.announcements);
      setPageCount(response_data.data.pagination.totalPages);
    } catch {
      toast({
        title: 'Greška',
        description: 'Došlo je do greške prilikom učitavanja obavijesti.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, status]);

  useEffect(() => {
    void fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Delete handler
  const handleDelete = useCallback((announcement: Announcement) => {
    setDeleteAnnouncement(announcement);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    void fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Columns
  const columns = useMemo(
    () => getColumns({ onDelete: handleDelete }),
    [handleDelete]
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <Button asChild>
          <Link href="/announcements/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nova obavijest
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={announcements}
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

      {deleteAnnouncement && (
        <DeleteDialog
          announcementId={deleteAnnouncement.id}
          announcementTitle={deleteAnnouncement.title}
          open={deleteAnnouncement !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteAnnouncement(null);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}

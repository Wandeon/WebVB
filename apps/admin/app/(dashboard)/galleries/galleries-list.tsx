'use client';

import { Button, toast } from '@repo/ui';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  DeleteDialog,
  getColumns,
  type Gallery,
} from '@/components/galleries';
import { Breadcrumbs } from '@/components/layout';

interface PaginatedResponse {
  success: boolean;
  data?: {
    galleries: Gallery[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: { message: string };
}

export function GalleriesList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') ?? '';

  // Local state
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Gallery | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || (key === 'page' && value === 1)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      router.push(`/galleries?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch galleries
  const fetchGalleries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);

      const response = await fetch(`/api/galleries?${params.toString()}`);
      const result = (await response.json()) as PaginatedResponse;

      if (result.success && result.data) {
        setGalleries(result.data.galleries);
        setPagination(result.data.pagination);
      }
    } catch {
      toast({
        title: 'Greska',
        description: 'Nije moguce ucitati galerije',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    void fetchGalleries();
  }, [fetchGalleries]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/galleries/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Brisanje nije uspjelo');
      }

      toast({
        title: 'Uspjeh',
        description: 'Galerija je uspjesno obrisana.',
        variant: 'success',
      });

      setDeleteTarget(null);
      void fetchGalleries();
    } catch {
      toast({
        title: 'Greska',
        description: 'Nije moguce obrisati galeriju',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () => getColumns({ onDelete: setDeleteTarget }),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
            Galerije
          </h1>
          <Breadcrumbs items={[{ label: 'Galerije' }]} className="mt-1" />
        </div>
        <Button asChild>
          <Link href="/galleries/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nova galerija
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(value) => updateParams({ search: value, page: 1 })}
      />

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={galleries} />
          <DataTablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={(newPage) => updateParams({ page: newPage })}
            onLimitChange={(newLimit) => updateParams({ limit: newLimit, page: 1 })}
          />
        </>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        gallery={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        isDeleting={isDeleting}
      />
    </div>
  );
}

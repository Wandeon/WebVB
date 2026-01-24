'use client';

import { Button, Card, CardContent, toast } from '@repo/ui';
import { Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataTable,
  DeleteDialog,
  EditDialog,
  getColumns,
  UploadDialog,
} from '@/components/documents';
import { Breadcrumbs } from '@/components/layout';

import type { DocumentWithUploader } from '@repo/database';
import type { PaginationState } from '@tanstack/react-table';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DocumentsApiResponse {
  success: true;
  data: {
    data: DocumentWithUploader[];
    pagination: PaginationData;
  };
}

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const year = searchParams.get('year') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  // State
  const [documents, setDocuments] = useState<DocumentWithUploader[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentWithUploader | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<DocumentWithUploader | null>(null);

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

      router.push(`/documents?${params.toString()}`);
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

  const handleYearChange = useCallback(
    (value: string) => {
      updateParams({ year: value, page: '1' });
    },
    [updateParams]
  );

  const handleResetFilters = useCallback(() => {
    router.push('/documents');
  }, [router]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      updateParams({ page: String(newPagination.pageIndex + 1) });
    },
    [updateParams]
  );

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');

      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (year) params.set('year', year);

      const response = await fetch(`/api/documents?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const response_data = (await response.json()) as DocumentsApiResponse;
      setDocuments(response_data.data.data);
      setPageCount(response_data.data.pagination.totalPages);
    } catch {
      toast({
        title: 'Greska',
        description: 'Doslo je do greske prilikom ucitavanja dokumenata.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, year]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  // Edit handler
  const handleEdit = useCallback((document: DocumentWithUploader) => {
    setEditingDocument(document);
  }, []);

  // Delete handler
  const handleDelete = useCallback((document: DocumentWithUploader) => {
    setDeletingDocument(document);
  }, []);

  const handleSuccess = useCallback(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  // Columns
  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
            Dokumenti
          </h1>
          <Breadcrumbs items={[{ label: 'Dokumenti' }]} className="mt-1" />
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Dodaj dokument
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={documents}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            search={search}
            category={category}
            year={year}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onYearChange={handleYearChange}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleSuccess}
      />

      <EditDialog
        document={editingDocument}
        open={editingDocument !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDocument(null);
        }}
        onSuccess={handleSuccess}
      />

      <DeleteDialog
        document={deletingDocument}
        open={deletingDocument !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingDocument(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

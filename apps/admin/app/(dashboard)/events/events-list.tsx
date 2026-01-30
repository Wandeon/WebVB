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
  type Event,
} from '@/components/events';
import { Breadcrumbs } from '@/components/layout';

interface PaginatedResponse {
  success: boolean;
  data?: {
    events: Event[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: { message: string };
}

export function EventsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const upcoming = searchParams.get('upcoming') === 'true';

  // Local state
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === false || (key === 'page' && value === 1)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      router.push(`/events?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (upcoming) params.set('upcoming', 'true');

      const response = await fetch(`/api/events?${params.toString()}`);
      const result = (await response.json()) as PaginatedResponse;

      if (result.success && result.data) {
        setEvents(result.data.events);
        setPagination(result.data.pagination);
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati događanja',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, from, to, upcoming]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  // Handle add to newsletter
  const handleAddToNewsletter = useCallback(async (event: Event) => {
    try {
      const response = await fetch('/api/newsletter/draft/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'event', id: event.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to newsletter');
      }

      toast({
        title: 'Dodano u newsletter',
        description: `"${event.title}" je dodano u newsletter.`,
      });
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće dodati u newsletter.',
        variant: 'destructive',
      });
    }
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Brisanje nije uspjelo');
      }

      toast({
        title: 'Uspjeh',
        description: 'Događanje je uspješno obrisano.',
        variant: 'success',
      });

      setDeleteTarget(null);
      void fetchEvents();
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće obrisati događanje',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () => getColumns({ onDelete: setDeleteTarget, onAddToNewsletter: handleAddToNewsletter }),
    [handleAddToNewsletter]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
            Događanja
          </h1>
          <Breadcrumbs items={[{ label: 'Događanja' }]} className="mt-1" />
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novo događanje
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(value) => updateParams({ search: value, page: 1 })}
        fromDate={from}
        onFromDateChange={(value) => updateParams({ from: value, page: 1 })}
        toDate={to}
        onToDateChange={(value) => updateParams({ to: value, page: 1 })}
        upcomingOnly={upcoming}
        onUpcomingOnlyChange={(value) => updateParams({ upcoming: value, page: 1 })}
      />

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={events} />
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
        event={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        isDeleting={isDeleting}
      />
    </div>
  );
}

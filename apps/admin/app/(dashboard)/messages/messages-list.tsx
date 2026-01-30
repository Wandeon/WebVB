'use client';

import { toast } from '@repo/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataTable,
  getColumns,
  MessageDialog,
  type ContactMessage,
} from '@/components/messages';

import type { PaginationState } from '@tanstack/react-table';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MessagesApiResponse {
  success: true;
  data: {
    messages: ContactMessage[];
    pagination: PaginationData;
  };
}

export function MessagesList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  // State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);

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
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`/messages?${params.toString()}`);
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

  const handleStatusChange = useCallback(
    (value: string) => {
      updateParams({ status: value, page: '1' });
    },
    [updateParams]
  );

  const handleResetFilters = useCallback(() => {
    router.push('/messages');
  }, [router]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      updateParams({ page: String(newPagination.pageIndex + 1) });
    },
    [updateParams]
  );

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');

      if (search) params.set('search', search);
      if (status && status !== 'all') params.set('status', status);

      const response = await fetch(`/api/messages?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const response_data = (await response.json()) as MessagesApiResponse;
      setMessages(response_data.data.messages);
      setPageCount(response_data.data.pagination.totalPages);
    } catch {
      toast({
        title: 'Greška',
        description: 'Došlo je do greške prilikom učitavanja poruka.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  // Status change handler (async version for internal use)
  const updateMessageStatus = useCallback(
    async (message: ContactMessage, newStatus: string) => {
      try {
        const response = await fetch(`/api/messages/${message.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        toast({
          title: 'Uspješno',
          description: 'Status poruke je ažuriran.',
        });

        void fetchMessages();
      } catch {
        toast({
          title: 'Greška',
          description: 'Došlo je do greške prilikom ažuriranja statusa.',
          variant: 'destructive',
        });
      }
    },
    [fetchMessages]
  );

  // Sync wrapper for event handlers
  const handleMessageStatusChange = useCallback(
    (message: ContactMessage, newStatus: string) => {
      void updateMessageStatus(message, newStatus);
    },
    [updateMessageStatus]
  );

  // View handler
  const handleView = useCallback((message: ContactMessage) => {
    setViewMessage(message);
  }, []);

  // Columns
  const columns = useMemo(
    () => getColumns({ onView: handleView, onStatusChange: handleMessageStatusChange }),
    [handleView, handleMessageStatusChange]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={messages}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        search={search}
        status={status}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
      />

      <MessageDialog
        message={viewMessage}
        open={viewMessage !== null}
        onOpenChange={(open) => {
          if (!open) setViewMessage(null);
        }}
        onStatusChange={handleMessageStatusChange}
      />
    </>
  );
}

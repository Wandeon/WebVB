'use client';

import { toast } from '@repo/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataTable,
  getColumns,
  ReportDialog,
  type ProblemReport,
} from '@/components/reports';

import type { PaginationState } from '@tanstack/react-table';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReportsApiResponse {
  success: true;
  data: {
    reports: ProblemReport[];
    pagination: PaginationData;
  };
}

export function ReportsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const problemType = searchParams.get('problemType') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  // State
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewReport, setViewReport] = useState<ProblemReport | null>(null);

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

      router.push(`/reports?${params.toString()}`);
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

  const handleProblemTypeChange = useCallback(
    (value: string) => {
      updateParams({ problemType: value, page: '1' });
    },
    [updateParams]
  );

  const handleResetFilters = useCallback(() => {
    router.push('/reports');
  }, [router]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      updateParams({ page: String(newPagination.pageIndex + 1) });
    },
    [updateParams]
  );

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');

      if (search) params.set('search', search);
      if (status && status !== 'all') params.set('status', status);
      if (problemType && problemType !== 'all') params.set('problemType', problemType);

      const response = await fetch(`/api/reports?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const response_data = (await response.json()) as ReportsApiResponse;
      setReports(response_data.data.reports);
      setPageCount(response_data.data.pagination.totalPages);
    } catch {
      toast({
        title: 'Greška',
        description: 'Došlo je do greške prilikom učitavanja prijava.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, problemType]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  // Status change handler (async version for internal use)
  const updateReportStatus = useCallback(
    async (report: ProblemReport, newStatus: string) => {
      try {
        const response = await fetch(`/api/reports/${report.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        toast({
          title: 'Uspješno',
          description: 'Status prijave je ažuriran.',
        });

        void fetchReports();
      } catch {
        toast({
          title: 'Greška',
          description: 'Došlo je do greške prilikom ažuriranja statusa.',
          variant: 'destructive',
        });
      }
    },
    [fetchReports]
  );

  // Sync wrapper for event handlers
  const handleReportStatusChange = useCallback(
    (report: ProblemReport, newStatus: string) => {
      void updateReportStatus(report, newStatus);
    },
    [updateReportStatus]
  );

  // View handler
  const handleView = useCallback((report: ProblemReport) => {
    setViewReport(report);
  }, []);

  // Columns
  const columns = useMemo(
    () => getColumns({ onView: handleView, onStatusChange: handleReportStatusChange }),
    [handleView, handleReportStatusChange]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={reports}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        search={search}
        status={status}
        problemType={problemType}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onProblemTypeChange={handleProblemTypeChange}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
      />

      <ReportDialog
        report={viewReport}
        open={viewReport !== null}
        onOpenChange={(open) => {
          if (!open) setViewReport(null);
        }}
        onStatusChange={handleReportStatusChange}
      />
    </>
  );
}

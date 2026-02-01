/**
 * AiQueueStatus - Orchestrator Component
 *
 * This component exceeds 300 lines because it coordinates:
 * - System status display (Ollama Cloud + Worker)
 * - Queue statistics grid (pending, processing, completed, failed)
 * - Recent jobs list with status badges
 * - Auto-refresh (10s) and manual refresh
 * - Manual job processing trigger
 *
 * Splitting would fragment the cohesive admin dashboard view.
 */
'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@repo/ui';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// =============================================================================
// Types
// =============================================================================

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  deadLetter: number;
  total: number;
  workerRunning: boolean;
  ollamaConfigured: boolean;
}

interface QueueJob {
  id: string;
  userId: string | null;
  requestType: string;
  inputData: Record<string, unknown>;
  status: string;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  processedAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

// =============================================================================
// Constants
// =============================================================================

const REQUEST_TYPE_LABELS: Record<string, string> = {
  post_generation: 'Generiranje objave',
  newsletter_intro: 'Newsletter uvod',
  content_summary: 'Sazimanje sadrzaja',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Na cekanju',
  processing: 'U obradi',
  completed: 'Zavrseno',
  failed: 'Neuspjelo',
  cancelled: 'Otkazano',
  dead_letter: 'Prekoraceno',
};

// Auto-refresh interval in milliseconds
const REFRESH_INTERVAL = 10000;

// =============================================================================
// Component
// =============================================================================

export function AiQueueStatus() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch queue stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/queue/stats');
      const result = (await response.json()) as ApiResponse<QueueStats>;

      if (result.success && result.data) {
        setStats(result.data);
        setFetchError(null);
      }
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : 'Nije moguće dohvatiti statistiku'
      );
    }
  }, []);

  // Fetch recent jobs
  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/queue?limit=10');
      const result = (await response.json()) as ApiResponse<{
        jobs: QueueJob[];
        pagination: Pagination;
      }>;

      if (result.success && result.data) {
        setJobs(result.data.jobs);
        setPagination(result.data.pagination);
        setFetchError(null);
      }
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : 'Nije moguće dohvatiti zadatke'
      );
    }
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchJobs()]);
  }, [fetchStats, fetchJobs]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    };
    void load();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  // Manual process trigger
  const handleProcessOne = useCallback(async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/queue/process', {
        method: 'POST',
      });
      const result = (await response.json()) as ApiResponse<{
        message: string;
        jobId?: string;
      }>;

      if (result.success && result.data) {
        toast({
          title: 'Obrada',
          description: result.data.message,
          variant: result.data.jobId ? 'success' : 'default',
        });
        // Refresh data after processing
        await fetchData();
      } else {
        throw new Error(result.error?.message);
      }
    } catch (error) {
      toast({
        title: 'Greska',
        description: error instanceof Error ? error.message : 'Nije moguce obraditi zadatak',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [fetchData]);

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Clock className="mr-1 h-3 w-3" />
            {STATUS_LABELS[status]}
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            {STATUS_LABELS[status]}
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {STATUS_LABELS[status]}
          </Badge>
        );
      case 'failed':
      case 'dead_letter':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            {STATUS_LABELS[status]}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-neutral-200 text-neutral-700">
            <XCircle className="mr-1 h-3 w-3" />
            {STATUS_LABELS[status]}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {fetchError}
        </div>
      )}
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ollama Cloud Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ollama Cloud</CardTitle>
            <CardDescription>Status AI servisa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats?.ollamaConfigured ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Konfiguriran</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-600">Nije konfiguriran</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Worker Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Queue Worker</CardTitle>
            <CardDescription>Status automatske obrade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats?.workerRunning ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Aktivan</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-600">Neaktivan</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Stats Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Statistika reda</CardTitle>
              <CardDescription>Pregled stanja AI zadataka</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleRefresh()}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Osvjezi
              </Button>
              <Button
                size="sm"
                onClick={() => void handleProcessOne()}
                disabled={isProcessing || !stats?.ollamaConfigured || stats?.pending === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Obrada...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Obradi jedan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{stats?.pending ?? 0}</div>
              <div className="text-sm text-amber-700 mt-1">Na cekanju</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats?.processing ?? 0}</div>
              <div className="text-sm text-blue-700 mt-1">U obradi</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.completed ?? 0}</div>
              <div className="text-sm text-green-700 mt-1">Zavrseno</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{stats?.failed ?? 0}</div>
              <div className="text-sm text-red-700 mt-1">Neuspjelo</div>
            </div>
            <div className="bg-neutral-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-neutral-600">
                {stats?.cancelled ?? 0}
              </div>
              <div className="text-sm text-neutral-700 mt-1">Otkazano</div>
            </div>
            <div className="bg-rose-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-rose-600">
                {stats?.deadLetter ?? 0}
              </div>
              <div className="text-sm text-rose-700 mt-1">Prekoraceno</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nedavni zadaci</CardTitle>
          <CardDescription>
            {pagination
              ? `Prikazano ${jobs.length} od ${pagination.total} zadataka`
              : 'Ucitavanje...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
              <p className="text-neutral-500 mb-2">Nema zadataka</p>
              <p className="text-sm text-neutral-400">
                AI zadaci ce se ovdje prikazati kada budu kreirani.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(job.status)}
                      <Badge variant="outline">
                        {REQUEST_TYPE_LABELS[job.requestType] ?? job.requestType}
                      </Badge>
                    </div>
                    <div className="text-sm text-neutral-600">
                      <span>Kreirano: {formatDate(job.createdAt)}</span>
                      {job.processedAt && (
                        <span className="ml-4">Obradeno: {formatDate(job.processedAt)}</span>
                      )}
                    </div>
                    {(['failed', 'dead_letter', 'cancelled'].includes(job.status)) &&
                      job.errorMessage && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 rounded p-2">
                        {job.errorMessage}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-neutral-400">
                      Pokusaji: {job.attempts}/{job.maxAttempts} | ID: {job.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

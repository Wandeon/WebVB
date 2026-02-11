'use client';

import { Card, CardContent, toast } from '@repo/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DataTable, getColumns, type MailLogEvent } from '@/components/mail-logs';
import { useAuth } from '@/components/providers/session-provider';

interface MailLogsApiResponse {
  success: true;
  data: {
    items: MailLogEvent[];
    total: number;
  };
}

const AUTO_REFRESH_INTERVAL = 30_000;

export function MailLogsList() {
  const { user } = useAuth();

  const [logs, setLogs] = useState<MailLogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.set('category', category);
      }

      const response = await fetch(`/api/mail-logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const responseData = (await response.json()) as MailLogsApiResponse;
      setLogs(responseData.data.items);
    } catch {
      toast({
        title: 'Greška',
        description: 'Došlo je do greške prilikom učitavanja zapisnika e-pošte.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (isAdmin) {
      void fetchLogs();
    }
  }, [fetchLogs, isAdmin]);

  useEffect(() => {
    if (autoRefresh && isAdmin) {
      intervalRef.current = setInterval(() => {
        void fetchLogs();
      }, AUTO_REFRESH_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, fetchLogs, isAdmin]);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
  }, []);

  const handleAutoRefreshToggle = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const columns = useMemo(() => getColumns(), []);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-neutral-500">
            Nemate ovlasti za pregled zapisnika e-pošte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <DataTable
          columns={columns}
          data={logs}
          isLoading={isLoading}
          category={category}
          onCategoryChange={handleCategoryChange}
          autoRefresh={autoRefresh}
          onAutoRefreshToggle={handleAutoRefreshToggle}
          onRefresh={handleRefresh}
        />
      </CardContent>
    </Card>
  );
}

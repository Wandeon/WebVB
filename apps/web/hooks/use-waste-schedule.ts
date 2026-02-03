'use client';

import { getPublicEnv } from '@repo/shared';
import { useCallback, useEffect, useState } from 'react';

const { NEXT_PUBLIC_API_URL } = getPublicEnv();
const API_URL = NEXT_PUBLIC_API_URL;
const STORAGE_KEY = 'vb-waste-schedule';

interface WasteEvent {
  id: string;
  title: string;
  eventDate: string;
  description?: string;
}

interface WasteScheduleData {
  events: WasteEvent[];
  syncedAt: string;
  currentMonth: number;
  currentYear: number;
}

interface ApiResponse {
  data?: WasteEvent[];
}

interface ServiceWorkerMessage {
  type: string;
  data?: WasteScheduleData;
}

interface UseWasteScheduleResult {
  events: WasteEvent[];
  isLoading: boolean;
  isOffline: boolean;
  lastSynced: Date | null;
  sync: () => Promise<void>;
}

export function useWasteSchedule(): UseWasteScheduleResult {
  const [events, setEvents] = useState<WasteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Load from localStorage on mount (for SSR hydration)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as WasteScheduleData;
        setEvents(data.events);
        setLastSynced(new Date(data.syncedAt));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for service worker messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      if (event.data?.type === 'WASTE_SCHEDULE_SYNCED' && event.data.data) {
        const data = event.data.data;
        setEvents(data.events);
        setLastSynced(new Date(data.syncedAt));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setIsLoading(false);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
    return undefined;
  }, []);

  // Sync function - request sync from service worker or fetch directly
  const sync = useCallback(async () => {
    setIsLoading(true);

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Request sync from service worker
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_WASTE_SCHEDULE',
          payload: { apiUrl: API_URL },
        });
      } else {
        // Fallback: fetch directly
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        const [currentRes, nextRes] = await Promise.all([
          fetch(`${API_URL}/api/public/events/calendar?month=${currentMonth}&year=${currentYear}`),
          fetch(`${API_URL}/api/public/events/calendar?month=${nextMonth}&year=${nextYear}`),
        ]);

        if (!currentRes.ok || !nextRes.ok) {
          throw new Error('Failed to fetch');
        }

        const [currentData, nextData] = await Promise.all([
          currentRes.json() as Promise<ApiResponse>,
          nextRes.json() as Promise<ApiResponse>,
        ]);

        const filterWasteEvents = (evts: WasteEvent[] | undefined) => {
          if (!evts || !Array.isArray(evts)) return [];
          return evts.filter((e) => e.title?.toLowerCase().includes('odvoz otpada'));
        };

        const wasteEvents = [
          ...filterWasteEvents(currentData.data),
          ...filterWasteEvents(nextData.data),
        ];

        const data: WasteScheduleData = {
          events: wasteEvents,
          syncedAt: new Date().toISOString(),
          currentMonth,
          currentYear,
        };

        setEvents(wasteEvents);
        setLastSynced(new Date());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      // If offline, use cached data
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial sync on mount
  useEffect(() => {
    void sync();
  }, [sync]);

  return {
    events,
    isLoading,
    isOffline,
    lastSynced,
    sync,
  };
}

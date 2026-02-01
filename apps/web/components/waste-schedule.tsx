'use client';

import { Calendar, Loader2, RefreshCw, Trash2, WifiOff } from 'lucide-react';
import { useMemo } from 'react';

import { useWasteSchedule } from '@/hooks';

interface WasteScheduleProps {
  limit?: number;
  showSyncStatus?: boolean;
}

// Waste type display names (Croatian)
const WASTE_TYPE_NAMES: Record<string, string> = {
  'miješani komunalni otpad': 'MKO',
  'biootpad': 'Bio',
  'plastika': 'Plastika',
  'papir i karton': 'Papir',
  'metal': 'Metal',
  'pelene': 'Pelene',
  'staklo': 'Staklo',
};

// Waste type colors
const WASTE_TYPE_COLORS: Record<string, string> = {
  'miješani komunalni otpad': 'bg-neutral-500',
  'biootpad': 'bg-amber-600',
  'plastika': 'bg-yellow-500',
  'papir i karton': 'bg-blue-500',
  'metal': 'bg-slate-500',
  'pelene': 'bg-pink-400',
  'staklo': 'bg-green-500',
};

function extractWasteType(title: string): string | null {
  const match = title.match(/^Odvoz otpada:\s*(.+)$/i);
  return match ? match[1]!.toLowerCase().trim() : null;
}

function formatDate(dateString: string): { day: string; weekday: string; month: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    weekday: date.toLocaleDateString('hr-HR', { weekday: 'short' }),
    month: date.toLocaleDateString('hr-HR', { month: 'short' }),
  };
}

function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isTomorrow(dateString: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = new Date(dateString);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

export function WasteSchedule({ limit = 5, showSyncStatus = true }: WasteScheduleProps) {
  const { events, isLoading, isOffline, lastSynced, sync } = useWasteSchedule();

  // Filter and sort upcoming events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return events
      .filter((event) => new Date(event.eventDate) >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, limit);
  }, [events, limit]);

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sync status */}
      {showSyncStatus && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            {isOffline ? (
              <>
                <WifiOff className="h-4 w-4" />
                <span>Offline način</span>
              </>
            ) : lastSynced ? (
              <>
                <Calendar className="h-4 w-4" />
                <span>
                  Ažurirano{' '}
                  {lastSynced.toLocaleDateString('hr-HR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </>
            ) : null}
          </div>
          {!isOffline && (
            <button
              onClick={() => void sync()}
              disabled={isLoading}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only sm:not-sr-only">Osvježi</span>
            </button>
          )}
        </div>
      )}

      {/* Events list */}
      {upcomingEvents.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
          Nema nadolazećih odvoza otpada
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingEvents.map((event) => {
            const wasteType = extractWasteType(event.title);
            const { day, weekday, month } = formatDate(event.eventDate);
            const colorClass = wasteType
              ? WASTE_TYPE_COLORS[wasteType] || 'bg-neutral-500'
              : 'bg-neutral-500';
            const typeName = wasteType
              ? WASTE_TYPE_NAMES[wasteType] || wasteType
              : 'Otpad';

            const today = isToday(event.eventDate);
            const tomorrow = isTomorrow(event.eventDate);

            return (
              <div
                key={event.id}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  today
                    ? 'border-primary-500 bg-primary-50'
                    : tomorrow
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50'
                }`}
              >
                {/* Date badge */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-medium uppercase text-neutral-500">{weekday}</span>
                  <span className={`text-xl font-bold ${today || tomorrow ? 'text-primary-600' : 'text-neutral-900'}`}>
                    {day}
                  </span>
                  <span className="text-xs text-neutral-500">{month}</span>
                </div>

                {/* Divider */}
                <div className="h-10 w-px bg-neutral-200" />

                {/* Waste type */}
                <div className="flex flex-1 items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colorClass}`}>
                    <Trash2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900 truncate">{typeName}</p>
                    {today && (
                      <p className="text-xs font-medium text-primary-600">Danas!</p>
                    )}
                    {tomorrow && (
                      <p className="text-xs font-medium text-amber-600">Sutra</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

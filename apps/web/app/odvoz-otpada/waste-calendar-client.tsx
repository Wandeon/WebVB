'use client';

import { Calendar, ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface WasteEvent {
  id: string;
  title: string;
  eventDate: string;
  description: string | null;
}

interface CalendarResponse {
  success: boolean;
  data?: {
    events: WasteEvent[];
  };
}

// Waste type colors and icons
const WASTE_TYPES: Record<string, { label: string; color: string; bgColor: string }> = {
  'miješani komunalni otpad': {
    label: 'MKO',
    color: 'text-neutral-700',
    bgColor: 'bg-neutral-100',
  },
  biootpad: {
    label: 'Bio',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  plastika: {
    label: 'Plastika',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  'papir i karton': {
    label: 'Papir',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  metal: {
    label: 'Metal',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
  },
  staklo: {
    label: 'Staklo',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  pelene: {
    label: 'Pelene',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
  },
};

function extractWasteType(title: string): string | null {
  const match = title.match(/^Odvoz otpada:\s*(.+)$/i);
  return match ? match[1]!.toLowerCase().trim() : null;
}

function getWasteTypeInfo(title: string) {
  const wasteType = extractWasteType(title);
  if (!wasteType) return null;
  return WASTE_TYPES[wasteType] || { label: wasteType, color: 'text-neutral-700', bgColor: 'bg-neutral-100' };
}

const MONTH_NAMES = [
  'Siječanj',
  'Veljača',
  'Ožujak',
  'Travanj',
  'Svibanj',
  'Lipanj',
  'Srpanj',
  'Kolovoz',
  'Rujan',
  'Listopad',
  'Studeni',
  'Prosinac',
];

const DAY_NAMES = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

export function WasteCalendarClient() {
  const [events, setEvents] = useState<WasteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch current and next month
      const [currentRes, nextRes] = await Promise.all([
        fetch(`${API_URL}/api/public/events/calendar?month=${currentMonth + 1}&year=${currentYear}`),
        fetch(`${API_URL}/api/public/events/calendar?month=${currentMonth === 11 ? 1 : currentMonth + 2}&year=${currentMonth === 11 ? currentYear + 1 : currentYear}`),
      ]);

      const [currentData, nextData] = await Promise.all([
        currentRes.json() as Promise<CalendarResponse>,
        nextRes.json() as Promise<CalendarResponse>,
      ]);

      // Filter only waste events
      const allEvents = [
        ...(currentData.data?.events || []),
        ...(nextData.data?.events || []),
      ].filter((e) => e.title.toLowerCase().includes('odvoz otpada'));

      setEvents(allEvents);
    } catch {
      setError('Nije moguće učitati raspored');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get upcoming events (next 5)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((e) => new Date(e.eventDate) >= today)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  // Build calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Events by date
  const eventsByDate: Record<string, WasteEvent[]> = {};
  events.forEach((event) => {
    const date = event.eventDate.slice(0, 10);
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date]!.push(event);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchEvents}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Pokušaj ponovno
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Upcoming Events - Left Side */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-neutral-900">
            <Trash2 className="h-5 w-5 text-green-600" />
            Sljedeći odvozi
          </h2>

          {upcomingEvents.length === 0 ? (
            <p className="text-neutral-500">Nema nadolazećih odvoza</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => {
                const eventDate = new Date(event.eventDate);
                const isToday = eventDate.toDateString() === today.toDateString();
                const isTomorrow =
                  eventDate.toDateString() ===
                  new Date(today.getTime() + 86400000).toDateString();
                const wasteInfo = getWasteTypeInfo(event.title);

                return (
                  <div
                    key={event.id}
                    className={`rounded-lg border p-4 ${
                      index === 0
                        ? 'border-green-300 bg-green-50'
                        : 'border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {isToday
                            ? 'Danas'
                            : isTomorrow
                            ? 'Sutra'
                            : eventDate.toLocaleDateString('hr-HR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                        </div>
                        {wasteInfo && (
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${wasteInfo.bgColor} ${wasteInfo.color}`}
                          >
                            {wasteInfo.label}
                          </span>
                        )}
                      </div>
                      <div className="text-right text-sm text-neutral-500">
                        {eventDate.toLocaleDateString('hr-HR', {
                          day: 'numeric',
                          month: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <div className="text-xs font-medium text-neutral-500">Vrste otpada:</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(WASTE_TYPES).slice(0, 4).map(([key, info]) => (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${info.bgColor} ${info.color}`}
                >
                  {info.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar - Right Side */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          {/* Calendar Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={goToPrevMonth}
              className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
              aria-label="Prethodni mjesec"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-neutral-900">
              <Calendar className="h-5 w-5 text-green-600" />
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToNextMonth}
              className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
              aria-label="Sljedeći mjesec"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-xs font-medium text-neutral-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isCurrentDay =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`relative aspect-square rounded-lg border p-1 ${
                    isCurrentDay
                      ? 'border-green-500 bg-green-50'
                      : dayEvents.length > 0
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-transparent'
                  }`}
                >
                  <div
                    className={`text-sm ${
                      isCurrentDay ? 'font-bold text-green-700' : 'text-neutral-700'
                    }`}
                  >
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                      {dayEvents.map((event) => {
                        const wasteInfo = getWasteTypeInfo(event.title);
                        return (
                          <div
                            key={event.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              wasteInfo ? wasteInfo.bgColor.replace('100', '500') : 'bg-green-500'
                            }`}
                            title={event.title}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

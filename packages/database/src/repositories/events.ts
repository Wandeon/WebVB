import { db } from '../client';
import { clampLimit, normalizePagination } from './pagination';

import type { Event, Prisma } from '@prisma/client';

export interface FindAllEventsOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
  upcoming?: boolean | undefined;
  excludeWaste?: boolean | undefined;
  sortBy?: 'eventDate' | 'createdAt' | 'title' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllEventsResult {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventSitemapEntry {
  id: string;
  updatedAt: Date;
  eventDate: Date;
}

export interface CreateEventData {
  title: string;
  description?: string | null;
  eventDate: Date;
  eventTime?: Date | null;
  endDate?: Date | null;
  location?: string | null;
  posterImage?: string | null;
}

export interface UpdateEventData {
  title?: string;
  description?: string | null;
  eventDate?: Date;
  eventTime?: Date | null;
  endDate?: Date | null;
  location?: string | null;
  posterImage?: string | null;
}

export const eventsRepository = {
  async findAll(options: FindAllEventsOptions = {}): Promise<FindAllEventsResult> {
    const {
      page = 1,
      limit = 20,
      search,
      from,
      to,
      upcoming,
      excludeWaste,
      sortBy = 'eventDate',
      sortOrder = 'asc',
    } = options;
    const { page: safePage, limit: safeLimit } = normalizePagination({
      page,
      limit,
      defaultLimit: 20,
    });

    const where: Prisma.EventWhereInput = {};
    const andFilters: Prisma.EventWhereInput[] = [];

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (from) {
      andFilters.push({ eventDate: { gte: from } });
    }

    if (to) {
      andFilters.push({ eventDate: { lte: to } });
    }

    if (upcoming) {
      const today = getZagrebStartOfDay();
      andFilters.push({
        OR: [
          { eventDate: { gte: today } },
          { endDate: { gte: today } },
        ],
      });
    }

    if (excludeWaste) {
      andFilters.push({
        NOT: { title: { startsWith: 'Odvoz otpada:', mode: 'insensitive' } },
      });
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    const total = await db.event.count({ where });
    const totalPages = Math.ceil(total / safeLimit);
    const clampedPage = Math.min(safePage, Math.max(totalPages, 1));
    const skip = (clampedPage - 1) * safeLimit;

    const events = await db.event.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: safeLimit,
    });

    return {
      events,
      pagination: {
        page: clampedPage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  },

  async findById(id: string): Promise<Event | null> {
    return db.event.findUnique({
      where: { id },
    });
  },

  async create(data: CreateEventData): Promise<Event> {
    return db.event.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        eventDate: data.eventDate,
        eventTime: data.eventTime ?? null,
        endDate: data.endDate ?? null,
        location: data.location ?? null,
        posterImage: data.posterImage ?? null,
      },
    });
  },

  async update(id: string, data: UpdateEventData): Promise<Event> {
    return db.event.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<Event> {
    return db.event.delete({ where: { id } });
  },

  async exists(id: string): Promise<boolean> {
    const count = await db.event.count({ where: { id } });
    return count > 0;
  },

  /**
   * Get upcoming events (from today onwards)
   */
  async getUpcomingEvents(limit: number = 5, excludeWaste: boolean = false): Promise<Event[]> {
    const today = getZagrebStartOfDay();
    const safeLimit = clampLimit(limit, 5);

    const where: Prisma.EventWhereInput = {
      OR: [
        { eventDate: { gte: today } },
        { endDate: { gte: today } },
      ],
    };

    if (excludeWaste) {
      where.NOT = { title: { startsWith: 'Odvoz otpada:', mode: 'insensitive' } };
    }

    return db.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
      take: safeLimit,
    });
  },

  /**
   * Get events for a specific month (for calendar display)
   */
  async getEventsByMonth(year: number, month: number, excludeWaste: boolean = false): Promise<Event[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const where: Prisma.EventWhereInput = {
      OR: [
        {
          eventDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          endDate: {
            gte: startDate,
          },
          eventDate: {
            lte: endDate,
          },
        },
      ],
    };

    if (excludeWaste) {
      where.NOT = { title: { startsWith: 'Odvoz otpada:', mode: 'insensitive' } };
    }

    return db.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });
  },

  /**
   * Get past events with pagination
   */
  async getPastEvents(
    options: { page?: number; limit?: number; excludeWaste?: boolean } = {}
  ): Promise<FindAllEventsResult> {
    const { page = 1, limit = 20, excludeWaste } = options;
    const { page: safePage, limit: safeLimit, skip } = normalizePagination({
      page,
      limit,
      defaultLimit: 20,
    });
    const today = getZagrebStartOfDay();

    const where: Prisma.EventWhereInput = {
      OR: [
        {
          endDate: { lt: today },
          eventDate: { lt: today },
        },
        {
          endDate: null,
          eventDate: { lt: today },
        },
      ],
    };

    if (excludeWaste) {
      where.NOT = { title: { startsWith: 'Odvoz otpada:', mode: 'insensitive' } };
    }

    const [total, events] = await Promise.all([
      db.event.count({ where }),
      db.event.findMany({
        where,
        orderBy: { eventDate: 'desc' },
        skip,
        take: safeLimit,
      }),
    ]);

    return {
      events,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  /**
   * Get events for sitemap generation
   */
  async findAllForSitemap(): Promise<EventSitemapEntry[]> {
    return db.event.findMany({
      select: { id: true, updatedAt: true, eventDate: true },
      orderBy: { eventDate: 'desc' },
    });
  },

  /**
   * Get waste collection events for a specific date
   * Waste events have titles like "Odvoz otpada: miješani komunalni otpad"
   */
  async getWasteEventsForDate(date: Date): Promise<Event[]> {
    // Normalize to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.event.findMany({
      where: {
        eventDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        title: {
          startsWith: 'Odvoz otpada:',
          mode: 'insensitive',
        },
      },
      orderBy: { title: 'asc' },
    });
  },

  /**
   * Get next upcoming waste collection events (for homepage card)
   * Returns up to `limit` events starting from today
   */
  async getNextWasteEvents(limit: number = 2): Promise<Event[]> {
    const today = getZagrebStartOfDay();
    const safeLimit = clampLimit(limit, 5);

    return db.event.findMany({
      where: {
        eventDate: { gte: today },
        title: { startsWith: 'Odvoz otpada:', mode: 'insensitive' },
      },
      orderBy: { eventDate: 'asc' },
      take: safeLimit,
    });
  },

  /**
   * Get waste collection events for the current week (Mon-Sun).
   * On Saturday, returns next week's events instead.
   */
  async getWeekWasteEvents(): Promise<Event[]> {
    const now = new Date();
    const zagrebNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Zagreb' }));
    const day = zagrebNow.getDay(); // 0=Sun, 1=Mon...

    const monday = new Date(zagrebNow);
    if (day === 6) {
      // Saturday: show next week
      monday.setDate(monday.getDate() + 2);
    } else {
      const daysFromMonday = day === 0 ? 6 : day - 1;
      monday.setDate(monday.getDate() - daysFromMonday);
    }
    monday.setHours(0, 0, 0, 0);

    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    return db.event.findMany({
      where: {
        eventDate: { gte: monday, lt: nextMonday },
        title: { startsWith: 'Odvoz otpada:', mode: 'insensitive' },
      },
      orderBy: { eventDate: 'asc' },
    });
  },
};

function getZagrebStartOfDay(): Date {
  const now = new Date();
  const zagrebNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Zagreb' }));
  zagrebNow.setHours(0, 0, 0, 0);
  return zagrebNow;
}

import { db } from '../client';

import type { Event, Prisma } from '@prisma/client';

export interface FindAllEventsOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
  upcoming?: boolean | undefined;
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
      sortBy = 'eventDate',
      sortOrder = 'asc',
    } = options;

    const where: Prisma.EventWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (from) {
      where.eventDate = { ...where.eventDate as Prisma.DateTimeFilter, gte: from };
    }

    if (to) {
      where.eventDate = { ...where.eventDate as Prisma.DateTimeFilter, lte: to };
    }

    if (upcoming) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.eventDate = { ...where.eventDate as Prisma.DateTimeFilter, gte: today };
    }

    const [total, events] = await Promise.all([
      db.event.count({ where }),
      db.event.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
  async getUpcomingEvents(limit: number = 5): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return db.event.findMany({
      where: {
        eventDate: { gte: today },
      },
      orderBy: { eventDate: 'asc' },
      take: limit,
    });
  },

  /**
   * Get events for a specific month (for calendar display)
   */
  async getEventsByMonth(year: number, month: number): Promise<Event[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return db.event.findMany({
      where: {
        eventDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { eventDate: 'asc' },
    });
  },

  /**
   * Get past events with pagination
   */
  async getPastEvents(
    options: { page?: number; limit?: number } = {}
  ): Promise<FindAllEventsResult> {
    const { page = 1, limit = 20 } = options;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: Prisma.EventWhereInput = {
      eventDate: { lt: today },
    };

    const [total, events] = await Promise.all([
      db.event.count({ where }),
      db.event.findMany({
        where,
        orderBy: { eventDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
};

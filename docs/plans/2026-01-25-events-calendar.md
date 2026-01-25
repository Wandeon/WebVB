# Events Calendar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build admin interface for managing events with date filtering, poster image uploads, and calendar-style list view.

**Architecture:** Follow documents pattern for R2 file upload (poster images) and pages pattern for form/list UI. Repository in @repo/database, API routes in admin app, DataTable list view with date filtering.

**Tech Stack:** Next.js 16, Prisma (Event model - already exists), TipTap editor for description, R2 for poster uploads, TanStack React Table, Zod validation, lucide-react icons

---

## Task 1: Add Event Types and Schemas to @repo/shared

**Files:**
- Create: `packages/shared/src/types/event.ts`
- Create: `packages/shared/src/schemas/event.ts`
- Modify: `packages/shared/src/types/index.ts`
- Modify: `packages/shared/src/schemas/index.ts`

**Step 1: Write Event types**

```typescript
// packages/shared/src/types/event.ts
export interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date;
  eventTime: Date | null;
  endDate: Date | null;
  location: string | null;
  posterImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Step 2: Write Event Zod schemas**

```typescript
// packages/shared/src/schemas/event.ts
import { z } from 'zod';

export const eventSchema = z.object({
  title: z
    .string()
    .min(2, 'Naslov mora imati najmanje 2 znaka')
    .max(200, 'Naslov može imati najviše 200 znakova'),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  eventDate: z.coerce.date({ required_error: 'Datum događanja je obavezan' }),
  eventTime: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  endDate: z.coerce
    .date()
    .nullable()
    .optional()
    .transform((val) => val || null),
  location: z
    .string()
    .max(200, 'Lokacija može imati najviše 200 znakova')
    .nullable()
    .optional()
    .transform((val) => val || null),
  posterImage: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export const createEventSchema = eventSchema;
export const updateEventSchema = eventSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  upcoming: z.coerce.boolean().optional(),
  sortBy: z.enum(['eventDate', 'createdAt', 'title']).default('eventDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type EventQueryInput = z.infer<typeof eventQuerySchema>;
```

**Step 3: Export from index files**

Add to `packages/shared/src/types/index.ts`:
```typescript
export type { Event } from './event';
```

Add to `packages/shared/src/schemas/index.ts`:
```typescript
export {
  eventSchema,
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  type CreateEventInput,
  type UpdateEventInput,
  type EventQueryInput,
} from './event';
```

**Step 4: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/shared/src/types/event.ts packages/shared/src/schemas/event.ts packages/shared/src/types/index.ts packages/shared/src/schemas/index.ts
git commit -m "feat(shared): add Event types and Zod schemas"
```

---

## Task 2: Create Events Repository in @repo/database

**Files:**
- Create: `packages/database/src/repositories/events.ts`
- Modify: `packages/database/src/repositories/index.ts`

**Step 1: Write Events repository**

```typescript
// packages/database/src/repositories/events.ts
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
};
```

**Step 2: Export from index**

Add to `packages/database/src/repositories/index.ts`:
```typescript
export {
  eventsRepository,
  type FindAllEventsOptions,
  type FindAllEventsResult,
  type CreateEventData,
  type UpdateEventData,
} from './events';
```

**Step 3: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/database/src/repositories/events.ts packages/database/src/repositories/index.ts
git commit -m "feat(database): add events repository with date filtering"
```

---

## Task 3: Create Events API Routes

**Files:**
- Create: `apps/admin/app/api/events/route.ts`
- Create: `apps/admin/app/api/events/[id]/route.ts`
- Create: `apps/admin/lib/validations/event.ts`
- Modify: `apps/admin/lib/logger.ts`

**Step 1: Create event validation schema**

```typescript
// apps/admin/lib/validations/event.ts
import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(2, 'Naslov mora imati najmanje 2 znaka')
    .max(200, 'Naslov može imati najviše 200 znakova'),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  eventDate: z.string().min(1, 'Datum događanja je obavezan'),
  eventTime: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  endDate: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  location: z
    .string()
    .max(200, 'Lokacija može imati najviše 200 znakova')
    .nullable()
    .optional()
    .transform((val) => val || null),
  posterImage: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export const createEventSchema = eventFormSchema;
export const updateEventSchema = eventFormSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  upcoming: z.coerce.boolean().optional(),
  sortBy: z.enum(['eventDate', 'createdAt', 'title']).default('eventDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type EventQueryInput = z.infer<typeof eventQuerySchema>;
```

**Step 2: Add eventsLogger to logger file**

Add to `apps/admin/lib/logger.ts`:
```typescript
export const eventsLogger = logger.child({ module: 'events' });
```

**Step 3: Create GET/POST /api/events route**

```typescript
// apps/admin/app/api/events/route.ts
import { eventsRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { eventsLogger } from '@/lib/logger';
import { createEventSchema, eventQuerySchema } from '@/lib/validations/event';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = eventQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      upcoming: searchParams.get('upcoming'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    if (!queryResult.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Nevaljani parametri upita',
        400
      );
    }

    const { page, limit, search, from, to, upcoming, sortBy, sortOrder } = queryResult.data;

    const result = await eventsRepository.findAll({
      page,
      limit,
      search,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      upcoming,
      sortBy,
      sortOrder,
    });

    return apiSuccess(result);
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom dohvaćanja događanja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja događanja',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const validationResult = createEventSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { title, description, eventDate, eventTime, endDate, location, posterImage } =
      validationResult.data;

    // Validate endDate is after eventDate if provided
    if (endDate && new Date(endDate) < new Date(eventDate)) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Završni datum mora biti nakon datuma početka',
        400
      );
    }

    const event = await eventsRepository.create({
      title,
      description,
      eventDate: new Date(eventDate),
      eventTime: eventTime ? new Date(`1970-01-01T${eventTime}:00`) : null,
      endDate: endDate ? new Date(endDate) : null,
      location,
      posterImage,
    });

    eventsLogger.info({ eventId: event.id }, 'Događanje uspješno stvoreno');

    return apiSuccess(event, 201);
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom stvaranja događanja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja događanja',
      500
    );
  }
}
```

**Step 4: Create GET/PUT/DELETE /api/events/[id] route**

```typescript
// apps/admin/app/api/events/[id]/route.ts
import { eventsRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { eventsLogger } from '@/lib/logger';
import { deleteFromR2, getR2KeyFromUrl } from '@/lib/r2';
import { updateEventSchema } from '@/lib/validations/event';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const event = await eventsRepository.findById(id);

    if (!event) {
      return apiError(ErrorCodes.NOT_FOUND, 'Događanje nije pronađeno', 404);
    }

    return apiSuccess(event);
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom dohvaćanja događanja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja događanja',
      500
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();

    const validationResult = updateEventSchema.safeParse({ ...body, id });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const existingEvent = await eventsRepository.findById(id);

    if (!existingEvent) {
      return apiError(ErrorCodes.NOT_FOUND, 'Događanje nije pronađeno', 404);
    }

    const { title, description, eventDate, eventTime, endDate, location, posterImage } =
      validationResult.data;

    // Validate endDate is after eventDate if both provided
    const finalEventDate = eventDate ? new Date(eventDate) : existingEvent.eventDate;
    const finalEndDate = endDate ? new Date(endDate) : existingEvent.endDate;
    if (finalEndDate && finalEndDate < finalEventDate) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Završni datum mora biti nakon datuma početka',
        400
      );
    }

    // Delete old poster from R2 if being replaced
    if (posterImage !== undefined && existingEvent.posterImage && posterImage !== existingEvent.posterImage) {
      const oldKey = getR2KeyFromUrl(existingEvent.posterImage);
      if (oldKey) {
        try {
          await deleteFromR2(oldKey);
        } catch (error) {
          eventsLogger.warn({ error, oldKey }, 'Failed to delete old poster from R2');
        }
      }
    }

    const event = await eventsRepository.update(id, {
      title,
      description,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      eventTime: eventTime !== undefined
        ? (eventTime ? new Date(`1970-01-01T${eventTime}:00`) : null)
        : undefined,
      endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      location,
      posterImage,
    });

    eventsLogger.info({ eventId: event.id }, 'Događanje uspješno ažurirano');

    return apiSuccess(event);
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom ažuriranja događanja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja događanja',
      500
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existingEvent = await eventsRepository.findById(id);

    if (!existingEvent) {
      return apiError(ErrorCodes.NOT_FOUND, 'Događanje nije pronađeno', 404);
    }

    // Delete poster from R2 if exists
    if (existingEvent.posterImage) {
      const key = getR2KeyFromUrl(existingEvent.posterImage);
      if (key) {
        try {
          await deleteFromR2(key);
        } catch (error) {
          eventsLogger.warn({ error, key }, 'Failed to delete poster from R2');
        }
      }
    }

    await eventsRepository.delete(id);

    eventsLogger.info({ eventId: id }, 'Događanje uspješno obrisano');

    return apiSuccess({ deleted: true });
  } catch (error) {
    eventsLogger.error({ error }, 'Greška prilikom brisanja događanja');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja događanja',
      500
    );
  }
}
```

**Step 5: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/admin/app/api/events apps/admin/lib/validations/event.ts apps/admin/lib/logger.ts
git commit -m "feat(admin): add events API routes with poster cleanup"
```

---

## Task 4: Create Event List Components

**Files:**
- Create: `apps/admin/components/events/columns.tsx`
- Create: `apps/admin/components/events/data-table.tsx`
- Create: `apps/admin/components/events/data-table-toolbar.tsx`
- Create: `apps/admin/components/events/data-table-pagination.tsx`
- Create: `apps/admin/components/events/delete-dialog.tsx`
- Create: `apps/admin/components/events/index.ts`

**Step 1: Create columns definition**

```typescript
// apps/admin/components/events/columns.tsx
'use client';

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { Calendar, MapPin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  endDate: string | null;
  location: string | null;
  posterImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetColumnsOptions {
  onDelete: (event: Event) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getColumns({ onDelete }: GetColumnsOptions): ColumnDef<Event>[] {
  return [
    {
      accessorKey: 'posterImage',
      header: '',
      cell: ({ row }) => {
        const poster = row.original.posterImage;
        return poster ? (
          <div className="relative h-12 w-12 overflow-hidden rounded">
            <Image
              src={poster}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded bg-neutral-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-neutral-400" aria-hidden="true" />
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <Link
            href={`/events/${event.id}/edit`}
            className="font-medium text-primary-600 hover:underline"
          >
            {event.title}
          </Link>
        );
      },
    },
    {
      accessorKey: 'eventDate',
      header: 'Datum',
      cell: ({ row }) => {
        const event = row.original;
        const isPast = new Date(event.eventDate) < new Date();
        return (
          <div className="flex flex-col gap-0.5">
            <span className={isPast ? 'text-neutral-400' : ''}>
              {formatDate(event.eventDate)}
              {event.endDate && event.endDate !== event.eventDate && (
                <> - {formatDate(event.endDate)}</>
              )}
            </span>
            {event.eventTime && (
              <span className="text-xs text-neutral-500">
                {formatTime(event.eventTime)}
              </span>
            )}
            {isPast && <Badge variant="secondary" className="w-fit text-xs">Prošlo</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Lokacija',
      cell: ({ row }) => {
        const location = row.original.location;
        return location ? (
          <div className="flex items-center gap-1 text-neutral-600">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            <span className="truncate max-w-[150px]">{location}</span>
          </div>
        ) : (
          <span className="text-neutral-400">—</span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Uredi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(event)}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Obriši
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
```

**Step 2: Create DataTable component**

```typescript
// apps/admin/components/events/data-table.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { Event } from './columns';
import type { ColumnDef } from '@tanstack/react-table';

interface DataTableProps {
  columns: ColumnDef<Event>[];
  data: Event[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nema događanja.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 3: Create DataTableToolbar with date filters**

```typescript
// apps/admin/components/events/data-table-toolbar.tsx
'use client';

import { Button, Input, Label, Switch } from '@repo/ui';
import { Search, X } from 'lucide-react';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  upcoming: boolean;
  onUpcomingChange: (value: boolean) => void;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  upcoming,
  onUpcomingChange,
}: DataTableToolbarProps) {
  const hasFilters = searchValue || fromDate || toDate || upcoming;

  const clearFilters = () => {
    onSearchChange('');
    onFromDateChange('');
    onToDateChange('');
    onUpcomingChange(false);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
        <Input
          placeholder="Pretraži događanja..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="from" className="text-xs">Od</Label>
          <Input
            id="from"
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-36"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="to" className="text-xs">Do</Label>
          <Input
            id="to"
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-36"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="upcoming"
            checked={upcoming}
            onCheckedChange={onUpcomingChange}
          />
          <Label htmlFor="upcoming" className="text-sm cursor-pointer">
            Samo nadolazeća
          </Label>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" aria-hidden="true" />
            Očisti
          </Button>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Create DataTablePagination**

```typescript
// apps/admin/components/events/data-table-pagination.tsx
'use client';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DataTablePagination({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: DataTablePaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-neutral-600">
        Prikazuje {startItem}-{endItem} od {total} događanja
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Po stranici:</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Prethodna stranica"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="px-2 text-sm text-neutral-600">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Sljedeća stranica"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Create DeleteDialog**

```typescript
// apps/admin/components/events/delete-dialog.tsx
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui';

import type { Event } from './columns';

interface DeleteDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteDialog({
  event,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Obrisati događanje?</AlertDialogTitle>
          <AlertDialogDescription>
            Jeste li sigurni da želite obrisati događanje &quot;{event?.title}&quot;?
            <span className="block mt-2">Ova radnja se ne može poništiti.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Brisanje...' : 'Obriši'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Step 6: Create index export**

```typescript
// apps/admin/components/events/index.ts
export { getColumns, type Event } from './columns';
export { DataTable } from './data-table';
export { DataTableToolbar } from './data-table-toolbar';
export { DataTablePagination } from './data-table-pagination';
export { DeleteDialog } from './delete-dialog';
```

**Step 7: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 8: Commit**

```bash
git add apps/admin/components/events
git commit -m "feat(admin): add events list components with date filtering"
```

---

## Task 5: Create EventForm Component with Poster Upload

**Files:**
- Create: `apps/admin/components/events/event-form.tsx`
- Create: `apps/admin/components/events/poster-upload.tsx`
- Modify: `apps/admin/components/events/index.ts`

**Step 1: Create PosterUpload component**

```typescript
// apps/admin/components/events/poster-upload.tsx
'use client';

import { Button } from '@repo/ui';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';

interface PosterUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  error?: boolean;
}

export function PosterUpload({ value, onChange, error }: PosterUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'events');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = (await response.json()) as { success: boolean; data?: { url: string } };
        if (data.success && data.data?.url) {
          onChange(data.data.url);
        }
      } catch {
        // Silently fail - user can retry
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  if (value) {
    return (
      <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
        <Image
          src={value}
          alt="Poster događanja"
          fill
          className="object-cover"
          sizes="(max-width: 384px) 100vw, 384px"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Ukloni poster</span>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center gap-2
        aspect-video w-full max-w-sm rounded-lg border-2 border-dashed
        transition-colors cursor-pointer
        ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'}
        ${error ? 'border-error' : ''}
        hover:border-primary-400 hover:bg-neutral-50
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      {isUploading ? (
        <>
          <Upload className="h-8 w-8 text-primary-500 animate-pulse" aria-hidden="true" />
          <p className="text-sm text-neutral-600">Učitavanje...</p>
        </>
      ) : (
        <>
          <ImagePlus className="h-8 w-8 text-neutral-400" aria-hidden="true" />
          <p className="text-sm text-neutral-600">
            Povucite sliku ili kliknite za odabir
          </p>
          <p className="text-xs text-neutral-400">PNG, JPG do 5MB</p>
        </>
      )}
    </div>
  );
}
```

**Step 2: Create EventForm component**

```typescript
// apps/admin/components/events/event-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  TipTapEditor,
  toast,
} from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { eventFormSchema } from '@/lib/validations/event';

import { PosterUpload } from './poster-upload';

import type { z } from 'zod';

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormData {
  id?: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  endDate: string | null;
  location: string | null;
  posterImage: string | null;
}

interface EventFormProps {
  initialData?: EventFormData;
}

function formatDateForInput(date: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0] ?? '';
}

function formatTimeForInput(time: string | Date | null): string {
  if (!time) return '';
  const d = new Date(time);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? null,
      eventDate: formatDateForInput(initialData?.eventDate ?? null),
      eventTime: formatTimeForInput(initialData?.eventTime ?? null),
      endDate: formatDateForInput(initialData?.endDate ?? null),
      location: initialData?.location ?? null,
      posterImage: initialData?.posterImage ?? null,
    },
  });

  const posterImage = watch('posterImage');

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/events/${initialData?.id}` : '/api/events';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          success: false;
          error?: { message?: string };
        };
        throw new Error(errorData.error?.message ?? 'Došlo je do greške');
      }

      toast({
        title: 'Uspjeh',
        description: isEditing
          ? 'Događanje je uspješno ažurirano.'
          : 'Događanje je uspješno stvoreno.',
        variant: 'success',
      });

      router.push('/events');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Greška',
        description:
          error instanceof Error ? error.message : 'Došlo je do greške',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="grid gap-6 lg:grid-cols-3">
      {/* Main Content - 2/3 width on desktop */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Osnovni podaci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" required>
                Naslov
              </Label>
              <Input
                id="title"
                placeholder="Unesite naslov događanja"
                error={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-error">{errors.title.message}</p>
              )}
            </div>

            {/* Description - TipTap Editor */}
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <TipTapEditor
                value={watch('description') ?? ''}
                onChange={(html) =>
                  setValue('description', html || null, { shouldValidate: true })
                }
                placeholder="Unesite opis događanja..."
                error={Boolean(errors.description)}
              />
              {errors.description && (
                <p className="text-sm text-error">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datum i vrijeme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="eventDate" required>
                  Datum početka
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  error={Boolean(errors.eventDate)}
                  {...register('eventDate')}
                />
                {errors.eventDate && (
                  <p className="text-sm text-error">{errors.eventDate.message}</p>
                )}
              </div>

              {/* Event Time */}
              <div className="space-y-2">
                <Label htmlFor="eventTime">Vrijeme početka</Label>
                <Input
                  id="eventTime"
                  type="time"
                  error={Boolean(errors.eventTime)}
                  {...register('eventTime')}
                />
                {errors.eventTime && (
                  <p className="text-sm text-error">{errors.eventTime.message}</p>
                )}
                <p className="text-xs text-neutral-500">
                  Ostavite prazno za cjelodnevni događaj
                </p>
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">Datum završetka</Label>
              <Input
                id="endDate"
                type="date"
                error={Boolean(errors.endDate)}
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-error">{errors.endDate.message}</p>
              )}
              <p className="text-xs text-neutral-500">
                Za višednevne događaje
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Sidebar - 1/3 width on desktop */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lokacija</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="location">Mjesto održavanja</Label>
              <Input
                id="location"
                placeholder="npr. Dom kulture"
                error={Boolean(errors.location)}
                {...register('location')}
              />
              {errors.location && (
                <p className="text-sm text-error">{errors.location.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Poster</CardTitle>
          </CardHeader>
          <CardContent>
            <PosterUpload
              value={posterImage ?? null}
              onChange={(url) => setValue('posterImage', url, { shouldValidate: true })}
              error={Boolean(errors.posterImage)}
            />
            {errors.posterImage && (
              <p className="text-sm text-error mt-2">{errors.posterImage.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Spremanje...' : 'Spremi'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Odustani
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
```

**Step 3: Export from index**

Add to `apps/admin/components/events/index.ts`:
```typescript
export { EventForm } from './event-form';
export { PosterUpload } from './poster-upload';
```

**Step 4: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/admin/components/events/event-form.tsx apps/admin/components/events/poster-upload.tsx apps/admin/components/events/index.ts
git commit -m "feat(admin): add EventForm component with poster upload"
```

---

## Task 6: Create Events Routes (List, New, Edit)

**Files:**
- Create: `apps/admin/app/(dashboard)/events/page.tsx`
- Create: `apps/admin/app/(dashboard)/events/events-list.tsx`
- Create: `apps/admin/app/(dashboard)/events/new/page.tsx`
- Create: `apps/admin/app/(dashboard)/events/[id]/edit/page.tsx`

**Step 1: Create events list page**

```typescript
// apps/admin/app/(dashboard)/events/page.tsx
import { Toaster } from '@repo/ui';
import { Suspense } from 'react';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';

import { EventsList } from './events-list';

export const metadata = {
  title: 'Događanja | Admin',
};

export default function EventsPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Događanja', href: '/events', current: true }]}
      />
      <Suspense fallback={<EventsListSkeleton />}>
        <EventsList />
      </Suspense>
      <Toaster />
    </>
  );
}

function EventsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
```

**Step 2: Create events list component with URL state**

```typescript
// apps/admin/app/(dashboard)/events/events-list.tsx
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
    () => getColumns({ onDelete: setDeleteTarget }),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Događanja</h1>
          <p className="text-neutral-600">Upravljajte događanjima i manifestacijama</p>
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
        toDate={to}
        onFromDateChange={(value) => updateParams({ from: value, page: 1 })}
        onToDateChange={(value) => updateParams({ to: value, page: 1 })}
        upcoming={upcoming}
        onUpcomingChange={(value) => updateParams({ upcoming: value, page: 1 })}
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
```

**Step 3: Create new event route**

```typescript
// apps/admin/app/(dashboard)/events/new/page.tsx
import { Toaster } from '@repo/ui';

import { EventForm } from '@/components/events';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

export const metadata = {
  title: 'Novo događanje | Admin',
};

export default function NewEventPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Događanja', href: '/events' },
          { label: 'Novo događanje', href: '/events/new', current: true },
        ]}
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Novo događanje</h1>
          <p className="text-neutral-600">Stvorite novo događanje ili manifestaciju</p>
        </div>
        <EventForm />
      </div>
      <Toaster />
    </>
  );
}
```

**Step 4: Create edit event route**

```typescript
// apps/admin/app/(dashboard)/events/[id]/edit/page.tsx
import { eventsRepository } from '@repo/database';
import { Toaster } from '@repo/ui';
import { notFound } from 'next/navigation';

import { EventForm } from '@/components/events';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

interface EditEventProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditEventProps) {
  const { id } = await params;
  const event = await eventsRepository.findById(id);

  return {
    title: event ? `Uredi: ${event.title} | Admin` : 'Događanje nije pronađeno',
  };
}

export default async function EditEventPage({ params }: EditEventProps) {
  const { id } = await params;
  const event = await eventsRepository.findById(id);

  if (!event) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Događanja', href: '/events' },
          { label: event.title, href: `/events/${event.id}/edit`, current: true },
        ]}
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Uredi događanje</h1>
          <p className="text-neutral-600">Ažurirajte podatke o događanju</p>
        </div>
        <EventForm
          initialData={{
            id: event.id,
            title: event.title,
            description: event.description,
            eventDate: event.eventDate.toISOString(),
            eventTime: event.eventTime?.toISOString() ?? null,
            endDate: event.endDate?.toISOString() ?? null,
            location: event.location,
            posterImage: event.posterImage,
          }}
        />
      </div>
      <Toaster />
    </>
  );
}
```

**Step 5: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/admin/app/\(dashboard\)/events
git commit -m "feat(admin): add events routes (list, new, edit)"
```

---

## Task 7: Add Events to Navigation

**Files:**
- Modify: `apps/admin/config/navigation.ts`

**Step 1: Add events link to navigation**

Find the "Sadržaj" section items array and add after "Dokumenti":
```typescript
{
  title: 'Događanja',
  href: '/events',
  icon: icon(CalendarDays),
},
```

Note: CalendarDays is already imported in the file.

**Step 2: Run type-check and lint**

Run: `pnpm type-check && pnpm lint`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/config/navigation.ts
git commit -m "feat(admin): add events link to sidebar navigation"
```

---

## Task 8: Add API Route Tests

**Files:**
- Create: `apps/admin/app/api/events/route.test.ts`

**Step 1: Create API tests**

```typescript
// apps/admin/app/api/events/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from './route';

// Mock the repository
vi.mock('@repo/database', () => ({
  eventsRepository: {
    findAll: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  eventsLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { eventsRepository } from '@repo/database';

describe('Events API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/events', () => {
    it('returns paginated events', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Dan općine',
          description: '<p>Opis</p>',
          eventDate: new Date('2026-02-15'),
          eventTime: null,
          endDate: null,
          location: 'Trg',
          posterImage: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(eventsRepository.findAll).mockResolvedValue({
        events: mockEvents,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const request = new Request('http://localhost/api/events');
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.events).toHaveLength(1);
    });

    it('filters by date range', async () => {
      vi.mocked(eventsRepository.findAll).mockResolvedValue({
        events: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const request = new Request(
        'http://localhost/api/events?from=2026-01-01&to=2026-12-31'
      );
      await GET(request as never);

      expect(eventsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(Date),
          to: expect.any(Date),
        })
      );
    });

    it('filters upcoming events', async () => {
      vi.mocked(eventsRepository.findAll).mockResolvedValue({
        events: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const request = new Request('http://localhost/api/events?upcoming=true');
      await GET(request as never);

      expect(eventsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          upcoming: true,
        })
      );
    });
  });

  describe('POST /api/events', () => {
    it('creates a new event', async () => {
      vi.mocked(eventsRepository.create).mockResolvedValue({
        id: '1',
        title: 'Novo događanje',
        description: '<p>Opis</p>',
        eventDate: new Date('2026-03-01'),
        eventTime: null,
        endDate: null,
        location: 'Dom kulture',
        posterImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Novo događanje',
          description: '<p>Opis</p>',
          eventDate: '2026-03-01',
          location: 'Dom kulture',
        }),
      });

      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Novo događanje');
    });

    it('validates required fields', async () => {
      const request = new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      });

      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('validates end date is after start date', async () => {
      const request = new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Događanje',
          eventDate: '2026-03-15',
          endDate: '2026-03-01',
        }),
      });

      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Završni datum');
    });
  });
});
```

**Step 2: Run tests**

Run: `pnpm test`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/app/api/events/route.test.ts
git commit -m "test(admin): add events API route tests"
```

---

## Task 9: Update CHANGELOG and ROADMAP

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

**Step 1: Add Sprint 1.8 entry to CHANGELOG**

Add under `## Unreleased`:
```markdown
## Sprint 1.8 - Events Calendar (Completed)

### Added
- Events repository in @repo/database with date filtering
- Event types and Zod schemas in @repo/shared
- Events API routes (GET, POST, PUT, DELETE) with R2 poster cleanup
- Events list page with DataTable and date filters
- EventForm component with TipTap editor and poster upload
- PosterUpload component for drag-drop image uploads
- Create/edit event routes
- Events link in admin sidebar navigation
- API route tests for events endpoints
- Gate: Create event with poster, filter by date, edit, delete (poster cleaned from R2)
```

**Step 2: Update ROADMAP Sprint 1.8 status**

Change line:
```markdown
| 1.8 ⬜ | Events calendar | 🔀 | 1.4 | CRUD for municipal events |
```
To:
```markdown
| 1.8 ✅ | Events calendar | 🔀 | 1.4 | CRUD for municipal events |
```

Update progress counter:
```markdown
**Progress:** 8/12
```

Update active sprint:
```markdown
**Active Sprint:** 1.9 - Gallery management
```

**Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

**Step 4: Commit**

```bash
git add CHANGELOG.md ROADMAP.md
git commit -m "docs: complete Sprint 1.8 - Events calendar"
```

---

## Task 10: Final Verification

**Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

**Step 2: Run type-check**

Run: `pnpm type-check`
Expected: No errors

**Step 3: Run lint**

Run: `pnpm lint`
Expected: No errors (warnings OK)

**Step 4: Run build**

Run: `pnpm build`
Expected: Build succeeds

**Step 5: Manual verification**

1. Start dev server: `pnpm dev --filter admin`
2. Navigate to http://localhost:3001/events
3. Click "Novo događanje" - form should load with date pickers and poster upload
4. Create an event with title, date, location, and upload a poster
5. Go back to list - event should appear with poster thumbnail
6. Use date filters to filter events
7. Toggle "Samo nadolazeća" - past events should be hidden
8. Edit the event - poster should be displayed, can replace it
9. Delete the event - confirm dialog should show

**Gate:** Create event with poster, filter by date range, toggle upcoming filter, edit it, delete it (verify poster cleaned from R2)

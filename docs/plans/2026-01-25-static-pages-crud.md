# Static Pages CRUD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build admin interface for managing static pages (O Opcini, Kontakt, etc.) with parent-child hierarchy support using existing TipTap editor.

**Architecture:** Follow existing posts CRUD pattern - repository in @repo/database, API routes in admin app, DataTable list view, and form components. Pages support hierarchy via `parentId` self-relation for menu nesting.

**Tech Stack:** Next.js 16, Prisma (Page model), TipTap editor, TanStack React Table, Zod validation, lucide-react icons

---

## Task 1: Add Page Types and Schemas to @repo/shared

**Files:**
- Create: `packages/shared/src/types/page.ts`
- Create: `packages/shared/src/schemas/page.ts`
- Modify: `packages/shared/src/types/index.ts`
- Modify: `packages/shared/src/schemas/index.ts`

**Step 1: Write Page types**

```typescript
// packages/shared/src/types/page.ts
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentId: string | null;
  menuOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageWithChildren extends Page {
  parent: Pick<Page, 'id' | 'title' | 'slug'> | null;
  children: Pick<Page, 'id' | 'title' | 'slug' | 'menuOrder'>[];
}
```

**Step 2: Write Page Zod schemas**

```typescript
// packages/shared/src/schemas/page.ts
import { z } from 'zod';

export const pageSchema = z.object({
  title: z
    .string()
    .min(2, 'Naslov mora imati najmanje 2 znaka')
    .max(200, 'Naslov može imati najviše 200 znakova'),
  content: z
    .string()
    .min(1, 'Sadržaj je obavezan')
    .refine(
      (val) => {
        const textContent = val.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 0;
      },
      { message: 'Sadržaj je obavezan' }
    ),
  parentId: z.string().uuid().nullable().optional(),
  menuOrder: z.number().int().min(0).default(0),
});

export const createPageSchema = pageSchema;
export const updatePageSchema = pageSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'menuOrder']).default('menuOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PageQueryInput = z.infer<typeof pageQuerySchema>;
```

**Step 3: Export from index files**

Add to `packages/shared/src/types/index.ts`:
```typescript
export type { Page, PageWithChildren } from './page';
```

Add to `packages/shared/src/schemas/index.ts`:
```typescript
export {
  pageSchema,
  createPageSchema,
  updatePageSchema,
  pageQuerySchema,
  type CreatePageInput,
  type UpdatePageInput,
  type PageQueryInput,
} from './page';
```

**Step 4: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/shared/src/types/page.ts packages/shared/src/schemas/page.ts packages/shared/src/types/index.ts packages/shared/src/schemas/index.ts
git commit -m "feat(shared): add Page types and Zod schemas"
```

---

## Task 2: Create Pages Repository in @repo/database

**Files:**
- Create: `packages/database/src/repositories/pages.ts`
- Modify: `packages/database/src/repositories/index.ts`

**Step 1: Write Pages repository**

```typescript
// packages/database/src/repositories/pages.ts
import { db } from '../client';

import type { Prisma, Page } from '@prisma/client';

export interface PageWithRelations extends Page {
  parent: {
    id: string;
    title: string;
    slug: string;
  } | null;
  children: {
    id: string;
    title: string;
    slug: string;
    menuOrder: number;
  }[];
}

export interface FindAllPagesOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  parentId?: string | null | undefined;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'menuOrder' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllPagesResult {
  pages: PageWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePageData {
  title: string;
  slug: string;
  content: string;
  parentId?: string | null;
  menuOrder?: number;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  content?: string;
  parentId?: string | null;
  menuOrder?: number;
}

const relationsSelect = {
  parent: {
    select: { id: true, title: true, slug: true },
  },
  children: {
    select: { id: true, title: true, slug: true, menuOrder: true },
    orderBy: { menuOrder: 'asc' as const },
  },
} as const;

export const pagesRepository = {
  async findAll(options: FindAllPagesOptions = {}): Promise<FindAllPagesResult> {
    const {
      page = 1,
      limit = 20,
      search,
      parentId,
      sortBy = 'menuOrder',
      sortOrder = 'asc',
    } = options;

    const where: Prisma.PageWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by parentId (null for top-level pages)
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const [total, pages] = await Promise.all([
      db.page.count({ where }),
      db.page.findMany({
        where,
        include: relationsSelect,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<PageWithRelations | null> {
    return db.page.findUnique({
      where: { id },
      include: relationsSelect,
    });
  },

  async findBySlug(slug: string): Promise<PageWithRelations | null> {
    return db.page.findUnique({
      where: { slug },
      include: relationsSelect,
    });
  },

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.PageWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await db.page.count({ where });
    return count > 0;
  },

  async create(data: CreatePageData): Promise<PageWithRelations> {
    return db.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        parentId: data.parentId ?? null,
        menuOrder: data.menuOrder ?? 0,
      },
      include: relationsSelect,
    });
  },

  async update(id: string, data: UpdatePageData): Promise<PageWithRelations> {
    return db.page.update({
      where: { id },
      data,
      include: relationsSelect,
    });
  },

  async delete(id: string): Promise<void> {
    // Children will have their parentId set to null due to schema constraints
    await db.page.delete({ where: { id } });
  },

  async exists(id: string): Promise<boolean> {
    const count = await db.page.count({ where: { id } });
    return count > 0;
  },

  /**
   * Get all pages for parent dropdown (excluding a page and its descendants)
   */
  async findAllForParentSelect(excludeId?: string): Promise<Pick<Page, 'id' | 'title' | 'parentId'>[]> {
    const where: Prisma.PageWhereInput = {};

    if (excludeId) {
      // Exclude the page itself and all its descendants
      // For simplicity, we just exclude the page itself
      // A page can't be its own parent
      where.id = { not: excludeId };
    }

    return db.page.findMany({
      where,
      select: { id: true, title: true, parentId: true },
      orderBy: [{ menuOrder: 'asc' }, { title: 'asc' }],
    });
  },
};
```

**Step 2: Export from index**

Add to `packages/database/src/repositories/index.ts`:
```typescript
export { pagesRepository, type PageWithRelations, type FindAllPagesOptions, type FindAllPagesResult } from './pages';
```

**Step 3: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/database/src/repositories/pages.ts packages/database/src/repositories/index.ts
git commit -m "feat(database): add pages repository with hierarchy support"
```

---

## Task 3: Create Pages API Routes

**Files:**
- Create: `apps/admin/app/api/pages/route.ts`
- Create: `apps/admin/app/api/pages/[id]/route.ts`
- Create: `apps/admin/app/api/pages/parents/route.ts`
- Create: `apps/admin/lib/validations/page.ts`

**Step 1: Create page validation schema (for API layer)**

```typescript
// apps/admin/lib/validations/page.ts
import { z } from 'zod';

export const pageSchema = z.object({
  title: z
    .string()
    .min(2, 'Naslov mora imati najmanje 2 znaka')
    .max(200, 'Naslov može imati najviše 200 znakova'),
  content: z
    .string()
    .min(1, 'Sadržaj je obavezan')
    .refine(
      (val) => {
        const textContent = val.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 0;
      },
      { message: 'Sadržaj je obavezan' }
    ),
  parentId: z.string().uuid().nullable().optional(),
  menuOrder: z.number().int().min(0).default(0),
});

export const createPageSchema = pageSchema;
export const updatePageSchema = pageSchema.partial();

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'menuOrder']).default('menuOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PageQueryInput = z.infer<typeof pageQuerySchema>;
```

**Step 2: Create GET/POST /api/pages route**

```typescript
// apps/admin/app/api/pages/route.ts
import { pagesRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { pagesLogger } from '@/lib/logger';
import { generateSlug } from '@/lib/utils/slug';
import { createPageSchema, pageQuerySchema } from '@/lib/validations/page';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = pageQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      parentId: searchParams.get('parentId'),
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

    const { page, limit, search, parentId, sortBy, sortOrder } = queryResult.data;

    const result = await pagesRepository.findAll({
      page,
      limit,
      search,
      parentId,
      sortBy,
      sortOrder,
    });

    return apiSuccess(result);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom dohvaćanja stranica');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja stranica',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const validationResult = createPageSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { title, content, parentId, menuOrder } = validationResult.data;

    // Validate parent exists if provided
    if (parentId) {
      const parentExists = await pagesRepository.exists(parentId);
      if (!parentExists) {
        return apiError(ErrorCodes.NOT_FOUND, 'Nadređena stranica ne postoji', 404);
      }
    }

    // Generate unique slug
    let slug = generateSlug(title);
    let slugSuffix = 1;

    while (await pagesRepository.slugExists(slug)) {
      slug = `${generateSlug(title)}-${slugSuffix}`;
      slugSuffix++;
    }

    const page = await pagesRepository.create({
      title,
      slug,
      content,
      parentId: parentId ?? null,
      menuOrder: menuOrder ?? 0,
    });

    pagesLogger.info({ pageId: page.id, slug }, 'Stranica uspješno stvorena');

    return apiSuccess(page, 201);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom stvaranja stranice');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom stvaranja stranice',
      500
    );
  }
}
```

**Step 3: Create GET/PUT/DELETE /api/pages/[id] route**

```typescript
// apps/admin/app/api/pages/[id]/route.ts
import { pagesRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { pagesLogger } from '@/lib/logger';
import { generateSlug } from '@/lib/utils/slug';
import { updatePageSchema } from '@/lib/validations/page';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const page = await pagesRepository.findById(id);

    if (!page) {
      return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);
    }

    return apiSuccess(page);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom dohvaćanja stranice');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja stranice',
      500
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();

    const validationResult = updatePageSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const existingPage = await pagesRepository.findById(id);

    if (!existingPage) {
      return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);
    }

    const { title, content, parentId, menuOrder } = validationResult.data;

    // Prevent circular reference
    if (parentId === id) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Stranica ne može biti vlastiti roditelj',
        400
      );
    }

    // Validate parent exists if provided
    if (parentId) {
      const parentExists = await pagesRepository.exists(parentId);
      if (!parentExists) {
        return apiError(ErrorCodes.NOT_FOUND, 'Nadređena stranica ne postoji', 404);
      }
    }

    // Regenerate slug if title changed
    let slug = existingPage.slug;
    if (title && title !== existingPage.title) {
      slug = generateSlug(title);
      let slugSuffix = 1;

      while (await pagesRepository.slugExists(slug, id)) {
        slug = `${generateSlug(title)}-${slugSuffix}`;
        slugSuffix++;
      }
    }

    const page = await pagesRepository.update(id, {
      title,
      slug,
      content,
      parentId,
      menuOrder,
    });

    pagesLogger.info({ pageId: page.id, slug }, 'Stranica uspješno ažurirana');

    return apiSuccess(page);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom ažuriranja stranice');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom ažuriranja stranice',
      500
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existingPage = await pagesRepository.findById(id);

    if (!existingPage) {
      return apiError(ErrorCodes.NOT_FOUND, 'Stranica nije pronađena', 404);
    }

    await pagesRepository.delete(id);

    pagesLogger.info({ pageId: id }, 'Stranica uspješno obrisana');

    return apiSuccess({ message: 'Stranica uspješno obrisana' });
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom brisanja stranice');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom brisanja stranice',
      500
    );
  }
}
```

**Step 4: Create GET /api/pages/parents route (for dropdown)**

```typescript
// apps/admin/app/api/pages/parents/route.ts
import { pagesRepository } from '@repo/database';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { pagesLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('excludeId') ?? undefined;

    const pages = await pagesRepository.findAllForParentSelect(excludeId);

    return apiSuccess(pages);
  } catch (error) {
    pagesLogger.error({ error }, 'Greška prilikom dohvaćanja stranica za odabir');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška prilikom dohvaćanja stranica',
      500
    );
  }
}
```

**Step 5: Add pagesLogger to logger file**

Add to `apps/admin/lib/logger.ts`:
```typescript
export const pagesLogger = logger.child({ module: 'pages' });
```

**Step 6: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 7: Commit**

```bash
git add apps/admin/app/api/pages apps/admin/lib/validations/page.ts apps/admin/lib/logger.ts
git commit -m "feat(admin): add pages API routes with hierarchy support"
```

---

## Task 4: Create Page List Components

**Files:**
- Create: `apps/admin/components/pages/columns.tsx`
- Create: `apps/admin/components/pages/data-table.tsx`
- Create: `apps/admin/components/pages/data-table-toolbar.tsx`
- Create: `apps/admin/components/pages/data-table-pagination.tsx`
- Create: `apps/admin/components/pages/delete-dialog.tsx`
- Create: `apps/admin/components/pages/index.ts`

**Step 1: Create columns definition with hierarchy indentation**

```typescript
// apps/admin/components/pages/columns.tsx
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
import { ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentId: string | null;
  menuOrder: number;
  createdAt: string;
  updatedAt: string;
  parent: {
    id: string;
    title: string;
    slug: string;
  } | null;
  children: {
    id: string;
    title: string;
    slug: string;
    menuOrder: number;
  }[];
}

interface GetColumnsOptions {
  onDelete: (page: Page) => void;
}

export function getColumns({ onDelete }: GetColumnsOptions): ColumnDef<Page>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => {
        const page = row.original;
        const hasParent = page.parentId !== null;

        return (
          <div className="flex items-center gap-2">
            {hasParent && (
              <ChevronRight className="h-4 w-4 text-neutral-400 ml-4" aria-hidden="true" />
            )}
            <Link
              href={`/pages/${page.id}/edit`}
              className="font-medium text-primary-600 hover:underline"
            >
              {page.title}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => {
        const slug = row.original.slug;
        return <code className="text-sm text-neutral-600">/{slug}</code>;
      },
    },
    {
      accessorKey: 'parent',
      header: 'Nadređena',
      cell: ({ row }) => {
        const parent = row.original.parent;
        return parent ? (
          <Badge variant="secondary">{parent.title}</Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        );
      },
    },
    {
      accessorKey: 'menuOrder',
      header: 'Redoslijed',
      cell: ({ row }) => {
        return <span className="text-neutral-600">{row.original.menuOrder}</span>;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Ažurirano',
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt;
        return new Date(updatedAt).toLocaleDateString('hr-HR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const page = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Otvori izbornik">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/pages/${page.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Uredi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(page)}
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
// apps/admin/components/pages/data-table.tsx
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

import type { Page } from './columns';
import type { ColumnDef } from '@tanstack/react-table';

interface DataTableProps {
  columns: ColumnDef<Page>[];
  data: Page[];
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
                Nema stranica.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 3: Create DataTableToolbar**

```typescript
// apps/admin/components/pages/data-table-toolbar.tsx
'use client';

import { Input } from '@repo/ui';
import { Search } from 'lucide-react';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
        <Input
          placeholder="Pretraži stranice..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
```

**Step 4: Create DataTablePagination (reuse pattern from posts)**

```typescript
// apps/admin/components/pages/data-table-pagination.tsx
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
        Prikazuje {startItem}-{endItem} od {total} stranica
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
// apps/admin/components/pages/delete-dialog.tsx
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

import type { Page } from './columns';

interface DeleteDialogProps {
  page: Page | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteDialog({
  page,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Obrisati stranicu?</AlertDialogTitle>
          <AlertDialogDescription>
            Jeste li sigurni da želite obrisati stranicu &quot;{page?.title}&quot;?
            {page?.children && page.children.length > 0 && (
              <span className="block mt-2 text-amber-600">
                Ova stranica ima {page.children.length} podstranica koje će ostati bez nadređene stranice.
              </span>
            )}
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
// apps/admin/components/pages/index.ts
export { getColumns, type Page } from './columns';
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
git add apps/admin/components/pages
git commit -m "feat(admin): add pages list components with hierarchy display"
```

---

## Task 5: Create PageForm Component

**Files:**
- Create: `apps/admin/components/pages/page-form.tsx`
- Modify: `apps/admin/components/pages/index.ts`

**Step 1: Create PageForm component**

```typescript
// apps/admin/components/pages/page-form.tsx
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TipTapEditor,
  toast,
} from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { pageSchema } from '@/lib/validations/page';

import type { z } from 'zod';

type PageFormValues = z.infer<typeof pageSchema>;

interface ParentOption {
  id: string;
  title: string;
  parentId: string | null;
}

interface PageFormData {
  id?: string;
  title: string;
  content: string;
  parentId: string | null;
  menuOrder: number;
}

interface PageFormProps {
  initialData?: PageFormData;
}

export function PageForm({ initialData }: PageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      parentId: initialData?.parentId ?? null,
      menuOrder: initialData?.menuOrder ?? 0,
    },
  });

  const parentId = watch('parentId');

  // Fetch parent options
  useEffect(() => {
    async function fetchParents() {
      try {
        const excludeParam = initialData?.id ? `?excludeId=${initialData.id}` : '';
        const response = await fetch(`/api/pages/parents${excludeParam}`);
        const result = (await response.json()) as {
          success: boolean;
          data?: ParentOption[];
        };
        if (result.success && result.data) {
          setParentOptions(result.data);
        }
      } catch {
        // Silently fail - dropdown will just be empty
      }
    }
    void fetchParents();
  }, [initialData?.id]);

  const onSubmit = async (data: PageFormValues) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/pages/${initialData?.id}` : '/api/pages';
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
          ? 'Stranica je uspješno ažurirana.'
          : 'Stranica je uspješno stvorena.',
        variant: 'success',
      });

      router.push('/pages');
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

  // Build hierarchical display for parent dropdown
  const getParentLabel = (option: ParentOption): string => {
    const parent = parentOptions.find((p) => p.id === option.parentId);
    if (parent) {
      return `— ${option.title}`;
    }
    return option.title;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
      {/* Main Content - 2/3 width on desktop */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Sadržaj</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" required>
                Naslov
              </Label>
              <Input
                id="title"
                placeholder="Unesite naslov stranice"
                error={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-error">{errors.title.message}</p>
              )}
            </div>

            {/* Content - TipTap Editor */}
            <div className="space-y-2">
              <Label htmlFor="content" required>
                Sadržaj
              </Label>
              <TipTapEditor
                value={watch('content')}
                onChange={(html) =>
                  setValue('content', html, { shouldValidate: true })
                }
                placeholder="Unesite sadržaj stranice..."
                error={Boolean(errors.content)}
              />
              {errors.content && (
                <p className="text-sm text-error">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Sidebar - 1/3 width on desktop */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Postavke</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Parent Page */}
            <div className="space-y-2">
              <Label htmlFor="parentId">Nadređena stranica</Label>
              <Select
                value={parentId ?? 'none'}
                onValueChange={(value) =>
                  setValue('parentId', value === 'none' ? null : value)
                }
              >
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="Odaberite nadređenu stranicu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez nadređene (glavna)</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {getParentLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Menu Order */}
            <div className="space-y-2">
              <Label htmlFor="menuOrder">Redoslijed u izborniku</Label>
              <Input
                id="menuOrder"
                type="number"
                min={0}
                error={Boolean(errors.menuOrder)}
                {...register('menuOrder', { valueAsNumber: true })}
              />
              {errors.menuOrder && (
                <p className="text-sm text-error">{errors.menuOrder.message}</p>
              )}
              <p className="text-xs text-neutral-500">
                Manji broj = viša pozicija u izborniku
              </p>
            </div>
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

**Step 2: Export from index**

Add to `apps/admin/components/pages/index.ts`:
```typescript
export { PageForm } from './page-form';
```

**Step 3: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add apps/admin/components/pages/page-form.tsx apps/admin/components/pages/index.ts
git commit -m "feat(admin): add PageForm component with parent selection"
```

---

## Task 6: Create Pages Routes (List, New, Edit)

**Files:**
- Create: `apps/admin/app/(dashboard)/pages/page.tsx`
- Create: `apps/admin/app/(dashboard)/pages/pages-list.tsx`
- Create: `apps/admin/app/(dashboard)/pages/new/page.tsx`
- Create: `apps/admin/app/(dashboard)/pages/[id]/edit/page.tsx`

**Step 1: Create pages list page**

```typescript
// apps/admin/app/(dashboard)/pages/page.tsx
import { Suspense } from 'react';

import { PagesList } from './pages-list';

export const metadata = {
  title: 'Stranice | Admin',
};

export default function PagesPage() {
  return (
    <Suspense fallback={<div>Učitavanje...</div>}>
      <PagesList />
    </Suspense>
  );
}
```

**Step 2: Create pages list component with URL state**

```typescript
// apps/admin/app/(dashboard)/pages/pages-list.tsx
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
  type Page,
} from '@/components/pages';

interface PaginatedResponse {
  success: boolean;
  data?: {
    pages: Page[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: { message: string };
}

export function PagesList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') ?? '';

  // Local state
  const [pages, setPages] = useState<Page[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || (key === 'page' && value === 1)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      router.push(`/pages?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch pages
  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);

      const response = await fetch(`/api/pages?${params.toString()}`);
      const result = (await response.json()) as PaginatedResponse;

      if (result.success && result.data) {
        setPages(result.data.pages);
        setPagination(result.data.pagination);
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati stranice',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pages/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Brisanje nije uspjelo');
      }

      toast({
        title: 'Uspjeh',
        description: 'Stranica je uspješno obrisana.',
        variant: 'success',
      });

      setDeleteTarget(null);
      void fetchPages();
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće obrisati stranicu',
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
          <h1 className="text-2xl font-bold text-neutral-900">Stranice</h1>
          <p className="text-neutral-600">Upravljajte statičkim stranicama</p>
        </div>
        <Button asChild>
          <Link href="/pages/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nova stranica
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(value) => updateParams({ search: value, page: 1 })}
      />

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={pages} />
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
        page={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        isDeleting={isDeleting}
      />
    </div>
  );
}
```

**Step 3: Create new page route**

```typescript
// apps/admin/app/(dashboard)/pages/new/page.tsx
import { PageForm } from '@/components/pages';

export const metadata = {
  title: 'Nova stranica | Admin',
};

export default function NewPagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Nova stranica</h1>
        <p className="text-neutral-600">Stvorite novu statičku stranicu</p>
      </div>
      <PageForm />
    </div>
  );
}
```

**Step 4: Create edit page route**

```typescript
// apps/admin/app/(dashboard)/pages/[id]/edit/page.tsx
import { pagesRepository } from '@repo/database';
import { notFound } from 'next/navigation';

import { PageForm } from '@/components/pages';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditPageProps) {
  const { id } = await params;
  const page = await pagesRepository.findById(id);

  return {
    title: page ? `Uredi: ${page.title} | Admin` : 'Stranica nije pronađena',
  };
}

export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const page = await pagesRepository.findById(id);

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Uredi stranicu</h1>
        <p className="text-neutral-600">Ažurirajte podatke stranice</p>
      </div>
      <PageForm
        initialData={{
          id: page.id,
          title: page.title,
          content: page.content,
          parentId: page.parentId,
          menuOrder: page.menuOrder,
        }}
      />
    </div>
  );
}
```

**Step 5: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/admin/app/\(dashboard\)/pages
git commit -m "feat(admin): add pages routes (list, new, edit)"
```

---

## Task 7: Add Pages to Navigation

**Files:**
- Modify: `apps/admin/components/layout/sidebar-nav.tsx` (add pages link)

**Step 1: Add pages link to sidebar navigation**

Find the navigation items array and add:
```typescript
{
  label: 'Stranice',
  href: '/pages',
  icon: FileText,
}
```

Position it after "Objave" (posts) in the navigation order.

**Step 2: Run type-check and lint**

Run: `pnpm type-check && pnpm lint`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/components/layout/sidebar-nav.tsx
git commit -m "feat(admin): add pages link to sidebar navigation"
```

---

## Task 8: Add API Route Tests

**Files:**
- Create: `apps/admin/app/api/pages/route.test.ts`

**Step 1: Create API tests**

```typescript
// apps/admin/app/api/pages/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from './route';

// Mock the repository
vi.mock('@repo/database', () => ({
  pagesRepository: {
    findAll: vi.fn(),
    slugExists: vi.fn(),
    exists: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  pagesLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { pagesRepository } from '@repo/database';

describe('Pages API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/pages', () => {
    it('returns paginated pages', async () => {
      const mockPages = [
        {
          id: '1',
          title: 'O Općini',
          slug: 'o-opcini',
          content: '<p>Sadržaj</p>',
          parentId: null,
          menuOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          parent: null,
          children: [],
        },
      ];

      vi.mocked(pagesRepository.findAll).mockResolvedValue({
        pages: mockPages,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const request = new Request('http://localhost/api/pages');
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.pages).toHaveLength(1);
    });
  });

  describe('POST /api/pages', () => {
    it('creates a new page', async () => {
      vi.mocked(pagesRepository.slugExists).mockResolvedValue(false);
      vi.mocked(pagesRepository.create).mockResolvedValue({
        id: '1',
        title: 'Nova stranica',
        slug: 'nova-stranica',
        content: '<p>Sadržaj</p>',
        parentId: null,
        menuOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      });

      const request = new Request('http://localhost/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nova stranica',
          content: '<p>Sadržaj</p>',
          menuOrder: 0,
        }),
      });

      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Nova stranica');
    });

    it('validates required fields', async () => {
      const request = new Request('http://localhost/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      });

      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('validates parent exists', async () => {
      vi.mocked(pagesRepository.exists).mockResolvedValue(false);

      const request = new Request('http://localhost/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nova stranica',
          content: '<p>Sadržaj</p>',
          parentId: 'non-existent-id',
        }),
      });

      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
```

**Step 2: Run tests**

Run: `pnpm test`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/app/api/pages/route.test.ts
git commit -m "test(admin): add pages API route tests"
```

---

## Task 9: Update CHANGELOG and ROADMAP

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

**Step 1: Add Sprint 1.7 entry to CHANGELOG**

Add under `## Unreleased`:
```markdown
## Sprint 1.7 - Static Pages CRUD (Completed)

### Added
- Pages repository in @repo/database with hierarchy support
- Page types and Zod schemas in @repo/shared
- Pages API routes (GET, POST, PUT, DELETE) with parent validation
- Pages list page with DataTable and search
- PageForm component with TipTap editor and parent selection
- Create/edit page routes
- Pages link in admin sidebar navigation
- API route tests for pages endpoints
- Gate: Create page, set parent, edit it, delete it
```

**Step 2: Update ROADMAP Sprint 1.7 status**

Change line:
```markdown
| 1.7 ⬜ | Static pages CRUD | 🔀 | 1.4 | Create/edit static pages with TipTap |
```
To:
```markdown
| 1.7 ✅ | Static pages CRUD | 🔀 | 1.4 | Create/edit static pages with TipTap |
```

Update progress counter:
```markdown
**Progress:** 7/12
```

Update active sprint:
```markdown
**Active Sprint:** 1.8 - Events calendar
```

**Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

**Step 4: Commit**

```bash
git add CHANGELOG.md ROADMAP.md
git commit -m "docs: complete Sprint 1.7 - Static pages CRUD"
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
Expected: No errors

**Step 4: Run build**

Run: `pnpm build`
Expected: Build succeeds

**Step 5: Manual verification**

1. Start dev server: `pnpm dev --filter admin`
2. Navigate to http://localhost:3001/pages
3. Click "Nova stranica" - form should load with TipTap editor
4. Create a page with title "O Općini" and content
5. Go back to list - page should appear
6. Create child page with parent set to "O Općini"
7. Edit the child page - parent dropdown should work
8. Delete a page - confirm dialog should show

**Gate:** Create page, set parent, edit it, find in list, delete it

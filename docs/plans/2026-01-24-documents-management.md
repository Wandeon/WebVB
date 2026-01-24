# Sprint 1.6: Documents Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add municipal document management with PDF upload to R2, categorization, and admin CRUD interface.

**Architecture:** Reusable DocumentUpload component in admin, API routes for CRUD, PDF validation with signature check, R2 for storage. Documents stored as single PDFs (no variants). Schemas and types in `@repo/shared` for client/server consistency.

**Tech Stack:** @aws-sdk/client-s3 (R2), Zod validation, TanStack Table, React Hook Form

---

## Constants & Types

**Document categories (10 total):**
- `sjednice` - Sjednice općinskog vijeća
- `proracun` - Proračun i financijski izvještaji
- `planovi` - Prostorni i urbanistički planovi
- `javna_nabava` - Javna nabava
- `izbori` - Izbori i referendumi
- `obrasci` - Obrasci za građane
- `odluke_nacelnika` - Odluke načelnika
- `strateski_dokumenti` - Strateški dokumenti
- `zakoni_i_propisi` - Zakoni i propisi
- `ostalo` - Ostalo

**Max file size:** 20MB (constant used everywhere)

**API Response format:** `{ success: true, data: Document[], pagination: {...} }` or `{ success: false, error: { code, message } }`

---

## Task 1: Add Document Constants and Types to Shared Package

**Files:**
- Create: `packages/shared/src/constants/documents.ts`
- Modify: `packages/shared/src/constants/index.ts`
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Create document constants file**

Create `packages/shared/src/constants/documents.ts`:

```ts
export const DOCUMENT_CATEGORIES = {
  sjednice: 'Sjednice općinskog vijeća',
  proracun: 'Proračun i financijski izvještaji',
  planovi: 'Prostorni i urbanistički planovi',
  javna_nabava: 'Javna nabava',
  izbori: 'Izbori i referendumi',
  obrasci: 'Obrasci za građane',
  odluke_nacelnika: 'Odluke načelnika',
  strateski_dokumenti: 'Strateški dokumenti',
  zakoni_i_propisi: 'Zakoni i propisi',
  ostalo: 'Ostalo',
} as const;

export type DocumentCategory = keyof typeof DOCUMENT_CATEGORIES;

export const DOCUMENT_CATEGORY_OPTIONS = Object.entries(DOCUMENT_CATEGORIES).map(
  ([value, label]) => ({ value, label })
);

export const DOCUMENT_MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const DOCUMENT_MAX_SIZE_MB = 20;
```

**Step 2: Update constants index**

Add to `packages/shared/src/constants/index.ts`:

```ts
export {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_OPTIONS,
  DOCUMENT_MAX_SIZE_BYTES,
  DOCUMENT_MAX_SIZE_MB,
  type DocumentCategory,
} from './documents';
```

Remove the old `DOCUMENT_CATEGORIES` array from the same file.

**Step 3: Add Document type**

Add to `packages/shared/src/types/index.ts`:

```ts
export type { DocumentCategory } from '../constants/documents';

export interface Document {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number | null;
  category: string;
  subcategory: string | null;
  year: number | null;
  uploadedBy: string | null;
  createdAt: Date;
}

export interface DocumentWithUploader extends Document {
  uploader: {
    id: string;
    name: string;
    email: string;
  } | null;
}
```

**Step 4: Run type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm type-check
```

**Step 5: Commit**

```bash
git add packages/shared/src/constants/documents.ts packages/shared/src/constants/index.ts packages/shared/src/types/index.ts
git commit -m "feat(shared): add document constants and types"
```

---

## Task 2: Create Document Validation Schemas

**Files:**
- Create: `packages/shared/src/schemas/document.ts`
- Create: `packages/shared/src/schemas/index.ts`
- Modify: `packages/shared/src/index.ts`

**Step 1: Create document schema file**

Create `packages/shared/src/schemas/document.ts`:

```ts
import { z } from 'zod';

import { DOCUMENT_CATEGORIES, DOCUMENT_MAX_SIZE_BYTES } from '../constants/documents';

const categoryKeys = Object.keys(DOCUMENT_CATEGORIES) as [
  keyof typeof DOCUMENT_CATEGORIES,
  ...Array<keyof typeof DOCUMENT_CATEGORIES>
];

const currentYear = new Date().getFullYear();

export const documentSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 znaka')
    .max(300, 'Naslov može imati najviše 300 znakova'),
  category: z.enum(categoryKeys, {
    errorMap: () => ({ message: 'Kategorija je obavezna' }),
  }),
  subcategory: z.string().max(100).nullable().optional(),
  year: z
    .number()
    .int()
    .min(1990, 'Godina mora biti između 1990 i sljedeće godine')
    .max(currentYear + 1, 'Godina mora biti između 1990 i sljedeće godine')
    .nullable()
    .optional(),
});

export const createDocumentSchema = documentSchema.extend({
  fileSize: z
    .number()
    .int()
    .positive()
    .max(DOCUMENT_MAX_SIZE_BYTES, `Datoteka je prevelika (max 20MB)`),
  fileUrl: z.string().url(),
});

export const updateDocumentSchema = documentSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

// For API query params
export const documentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  year: z.coerce.number().int().optional(),
  sortBy: z.enum(['createdAt', 'title', 'year', 'fileSize']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
```

**Step 2: Create schemas index**

Create `packages/shared/src/schemas/index.ts`:

```ts
export {
  documentSchema,
  createDocumentSchema,
  updateDocumentSchema,
  documentQuerySchema,
  type CreateDocumentInput,
  type UpdateDocumentInput,
  type DocumentQueryInput,
} from './document';
```

**Step 3: Update shared package index**

Add to `packages/shared/src/index.ts`:

```ts
export * from './schemas';
```

**Step 4: Install zod in shared package**

```bash
cd /mnt/c/VelikiBukovec_web/packages/shared && pnpm add zod
```

**Step 5: Run type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm type-check
```

**Step 6: Commit**

```bash
git add packages/shared/src/schemas/document.ts packages/shared/src/schemas/index.ts packages/shared/src/index.ts packages/shared/package.json pnpm-lock.yaml
git commit -m "feat(shared): add document validation schemas"
```

---

## Task 3: Create Documents Repository

**Files:**
- Create: `packages/database/src/repositories/documents.ts`
- Modify: `packages/database/src/repositories/index.ts`

**Step 1: Create documents repository**

Create `packages/database/src/repositories/documents.ts`:

```ts
import { db } from '../client';

import type { Document, Prisma } from '@prisma/client';

export interface DocumentWithUploader extends Document {
  uploader: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface FindAllDocumentsOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  year?: number;
  sortBy?: 'createdAt' | 'title' | 'year' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

export interface FindAllDocumentsResult {
  documents: DocumentWithUploader[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateDocumentData {
  title: string;
  fileUrl: string;
  fileSize: number;
  category: string;
  subcategory?: string | null;
  year?: number | null;
  uploadedBy?: string | null;
}

export interface UpdateDocumentData {
  title?: string;
  category?: string;
  subcategory?: string | null;
  year?: number | null;
}

const uploaderSelect = {
  id: true,
  name: true,
  email: true,
} as const;

export const documentsRepository = {
  async findAll(options: FindAllDocumentsOptions = {}): Promise<FindAllDocumentsResult> {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      year,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: Prisma.DocumentWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subcategory: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (year) {
      where.year = year;
    }

    const [total, documents] = await Promise.all([
      db.document.count({ where }),
      db.document.findMany({
        where,
        include: { uploader: { select: uploaderSelect } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<DocumentWithUploader | null> {
    return db.document.findUnique({
      where: { id },
      include: { uploader: { select: uploaderSelect } },
    });
  },

  async create(data: CreateDocumentData): Promise<DocumentWithUploader> {
    return db.document.create({
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        category: data.category,
        subcategory: data.subcategory ?? null,
        year: data.year ?? null,
        uploadedBy: data.uploadedBy ?? null,
      },
      include: { uploader: { select: uploaderSelect } },
    });
  },

  async update(id: string, data: UpdateDocumentData): Promise<DocumentWithUploader> {
    return db.document.update({
      where: { id },
      data,
      include: { uploader: { select: uploaderSelect } },
    });
  },

  async delete(id: string): Promise<Document> {
    return db.document.delete({ where: { id } });
  },

  async exists(id: string): Promise<boolean> {
    const count = await db.document.count({ where: { id } });
    return count > 0;
  },
};
```

**Step 2: Export from repositories index**

Add to `packages/database/src/repositories/index.ts`:

```ts
export { documentsRepository } from './documents';
export type {
  DocumentWithUploader,
  FindAllDocumentsOptions,
  FindAllDocumentsResult,
  CreateDocumentData,
  UpdateDocumentData,
} from './documents';
```

**Step 3: Run type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm type-check
```

**Step 4: Commit**

```bash
git add packages/database/src/repositories/documents.ts packages/database/src/repositories/index.ts
git commit -m "feat(database): add documents repository"
```

---

## Task 4: Create Documents Logger

**Files:**
- Modify: `apps/admin/lib/logger.ts`

**Step 1: Add documents logger**

Add to `apps/admin/lib/logger.ts`:

```ts
export const documentsLogger = logger.child({ module: 'documents' });
```

**Step 2: Run lint**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint
```

**Step 3: Commit**

```bash
git add apps/admin/lib/logger.ts
git commit -m "feat(admin): add documents logger"
```

---

## Task 5: Create Document Upload API Route

**Files:**
- Create: `apps/admin/app/api/documents/upload/route.ts`

**Step 1: Create the upload route**

Create `apps/admin/app/api/documents/upload/route.ts`:

```ts
import { randomUUID } from 'crypto';

import { DOCUMENT_MAX_SIZE_BYTES, DOCUMENT_MAX_SIZE_MB } from '@repo/shared';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { documentsLogger } from '@/lib/logger';
import { uploadToR2 } from '@/lib/r2';

const PDF_SIGNATURE = '%PDF-';

function isPdfFile(buffer: Buffer): boolean {
  const header = buffer.subarray(0, 5).toString('ascii');
  return header === PDF_SIGNATURE;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Datoteka nije odabrana',
        400
      );
    }

    // Validate file size
    if (file.size > DOCUMENT_MAX_SIZE_BYTES) {
      documentsLogger.warn(
        { size: file.size, maxSize: DOCUMENT_MAX_SIZE_BYTES },
        'File too large'
      );
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        `Datoteka je prevelika (max ${DOCUMENT_MAX_SIZE_MB}MB)`,
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate PDF signature
    if (!isPdfFile(buffer)) {
      documentsLogger.warn({ filename: file.name }, 'Invalid PDF file');
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Datoteka nije valjani PDF',
        400
      );
    }

    const id = randomUUID();
    const key = `documents/${id}.pdf`;

    const fileUrl = await uploadToR2(key, buffer, 'application/pdf');

    documentsLogger.info({ documentId: id, size: file.size }, 'Document uploaded successfully');

    return apiSuccess({
      id,
      fileUrl,
      fileSize: file.size,
    });
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to upload document');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri spremanju. Pokušajte ponovno.',
      500
    );
  }
}
```

**Step 2: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 3: Commit**

```bash
git add apps/admin/app/api/documents/upload/route.ts
git commit -m "feat(admin): add document upload API with PDF validation"
```

---

## Task 6: Create Documents CRUD API Routes

**Files:**
- Create: `apps/admin/app/api/documents/route.ts`
- Create: `apps/admin/app/api/documents/[id]/route.ts`

**Step 1: Create list and create route**

Create `apps/admin/app/api/documents/route.ts`:

```ts
import { documentsRepository } from '@repo/database';
import { createDocumentSchema, documentQuerySchema } from '@repo/shared';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { documentsLogger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// GET /api/documents - List documents with filtering, pagination, sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = documentQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      year: searchParams.get('year'),
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

    const { page, limit, search, category, year, sortBy, sortOrder } =
      queryResult.data;

    const result = await documentsRepository.findAll({
      page,
      limit,
      search,
      category,
      year,
      sortBy,
      sortOrder,
    });

    return apiSuccess({
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to fetch documents');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}

// POST /api/documents - Create new document (metadata only, file already uploaded)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add auth check - require Staff role
    // const session = await getSession(request);
    // if (!session) {
    //   return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    // }

    const body: unknown = await request.json();

    const validationResult = createDocumentSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const { title, category, subcategory, year, fileUrl, fileSize } =
      validationResult.data;

    const document = await documentsRepository.create({
      title,
      fileUrl,
      fileSize,
      category,
      subcategory: subcategory ?? null,
      year: year ?? null,
      uploadedBy: null, // TODO: get from session
    });

    // TODO: Audit log
    // await auditLog.create({
    //   action: 'document.created',
    //   entityType: 'document',
    //   entityId: document.id,
    //   changes: { title, category, year },
    //   userId: session.user.id,
    //   ipAddress: getClientIp(request),
    // });

    documentsLogger.info(
      { documentId: document.id, category, title },
      'Document created successfully'
    );

    return apiSuccess(document, 201);
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to create document');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}
```

**Step 2: Create update and delete route**

Create `apps/admin/app/api/documents/[id]/route.ts`:

```ts
import { documentsRepository } from '@repo/database';
import { updateDocumentSchema } from '@repo/shared';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { documentsLogger } from '@/lib/logger';
import { deleteFromR2, getR2KeyFromUrl } from '@/lib/r2';

import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/documents/[id] - Update document metadata
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add auth check - require Staff role
    // const session = await getSession(request);
    // if (!session) {
    //   return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    // }

    const { id } = await params;
    const body: unknown = await request.json();

    const validationResult = updateDocumentSchema.safeParse({
      ...(body as Record<string, unknown>),
      id,
    });

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const errorMessage = firstIssue?.message ?? 'Nevaljani podaci';
      return apiError(ErrorCodes.VALIDATION_ERROR, errorMessage, 400);
    }

    const existingDocument = await documentsRepository.findById(id);

    if (!existingDocument) {
      return apiError(ErrorCodes.NOT_FOUND, 'Dokument nije pronađen', 404);
    }

    const { title, category, subcategory, year } = validationResult.data;

    const updateData: Parameters<typeof documentsRepository.update>[1] = {};

    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (year !== undefined) updateData.year = year;

    const document = await documentsRepository.update(id, updateData);

    // TODO: Audit log with changed fields

    documentsLogger.info({ documentId: id }, 'Document updated successfully');

    return apiSuccess(document);
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to update document');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add auth check - require Admin role
    // const session = await getSession(request);
    // if (!session) {
    //   return apiError(ErrorCodes.UNAUTHORIZED, 'Niste prijavljeni', 401);
    // }
    // if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
    //   return apiError(ErrorCodes.FORBIDDEN, 'Nemate ovlasti za brisanje', 403);
    // }

    const { id } = await params;

    const existingDocument = await documentsRepository.findById(id);

    if (!existingDocument) {
      return apiError(
        ErrorCodes.NOT_FOUND,
        'Dokument je već obrisan ili nije pronađen',
        404
      );
    }

    // Delete from DB first
    const deletedDocument = await documentsRepository.delete(id);

    // Best-effort R2 deletion (log errors but don't fail)
    const r2Key = getR2KeyFromUrl(existingDocument.fileUrl);
    if (r2Key) {
      try {
        await deleteFromR2(r2Key);
        documentsLogger.info({ documentId: id, r2Key }, 'Document file deleted from R2');
      } catch (r2Error) {
        documentsLogger.error(
          { documentId: id, r2Key, error: r2Error },
          'Failed to delete document file from R2 (DB record already deleted)'
        );
      }
    }

    // TODO: Audit log with category + year

    documentsLogger.info(
      { documentId: id, title: deletedDocument.title },
      'Document deleted successfully'
    );

    return apiSuccess({ deleted: true });
  } catch (error) {
    documentsLogger.error({ error }, 'Failed to delete document');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška servera. Pokušajte ponovno.',
      500
    );
  }
}
```

**Step 3: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 4: Commit**

```bash
git add apps/admin/app/api/documents/route.ts apps/admin/app/api/documents/[id]/route.ts
git commit -m "feat(admin): add documents CRUD API routes"
```

---

## Task 7: Create DocumentUpload Component

**Files:**
- Create: `apps/admin/components/documents/document-upload.tsx`

**Step 1: Create the component**

Create `apps/admin/components/documents/document-upload.tsx`:

```tsx
'use client';

import { useCallback, useState } from 'react';

import { DOCUMENT_MAX_SIZE_BYTES, DOCUMENT_MAX_SIZE_MB } from '@repo/shared';
import { cn } from '@repo/ui';

export interface DocumentUploadProps {
  onUploadComplete: (data: { id: string; fileUrl: string; fileSize: number }) => void;
  disabled?: boolean;
  className?: string;
}

export function DocumentUpload({
  onUploadComplete,
  disabled = false,
  className,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Dozvoljeni format: PDF';
    }
    if (file.size > DOCUMENT_MAX_SIZE_BYTES) {
      return `Datoteka je prevelika (max ${DOCUMENT_MAX_SIZE_MB}MB)`;
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        const result = (await response.json()) as {
          success: boolean;
          data?: { id: string; fileUrl: string; fileSize: number };
          error?: { message: string };
        };

        if (!result.success) {
          setError(result.error?.message ?? 'Greška pri učitavanju');
          return;
        }

        if (result.data) {
          onUploadComplete(result.data);
        }
      } catch {
        setError('Greška pri učitavanju dokumenta');
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [disabled, isUploading, uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void uploadFile(file);
      }
      e.target.value = '';
    },
    [uploadFile]
  );

  return (
    <div className={className}>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-full h-32 border-2 border-dashed rounded-lg cursor-pointer',
          'transition-colors',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50',
          error && 'border-error bg-red-50',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="sr-only"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-neutral-600">Učitavanje...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-400"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <div>
              <span className="text-sm font-medium text-primary-600">
                Kliknite za odabir
              </span>
              <span className="text-sm text-neutral-500">
                {' '}
                ili povucite PDF
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              PDF (max {DOCUMENT_MAX_SIZE_MB}MB)
            </span>
          </div>
        )}
      </label>

      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
```

**Step 2: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 3: Commit**

```bash
git add apps/admin/components/documents/document-upload.tsx
git commit -m "feat(admin): add DocumentUpload component"
```

---

## Task 8: Create DocumentUpload Tests

**Files:**
- Create: `apps/admin/components/documents/document-upload.test.tsx`

**Step 1: Create tests**

Create `apps/admin/components/documents/document-upload.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DocumentUpload } from './document-upload';

describe('DocumentUpload', () => {
  it('renders drop zone with instructions', () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} />);
    expect(screen.getByText('Kliknite za odabir')).toBeInTheDocument();
    expect(screen.getByText(/povucite PDF/)).toBeInTheDocument();
  });

  it('shows file type hint', () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} />);
    expect(screen.getByText(/PDF \(max 20MB\)/)).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} disabled />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
  });

  it('accepts only PDF files', () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'application/pdf');
  });

  it('shows error for invalid file type', async () => {
    render(<DocumentUpload onUploadComplete={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', {
      value: [invalidFile],
    });

    fireEvent.change(input);

    expect(await screen.findByText('Dozvoljeni format: PDF')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DocumentUpload onUploadComplete={vi.fn()} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

**Step 2: Run tests**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin && pnpm test
```

**Step 3: Commit**

```bash
git add apps/admin/components/documents/document-upload.test.tsx
git commit -m "test(admin): add DocumentUpload component tests"
```

---

## Task 9: Create Documents Data Table Components

**Files:**
- Create: `apps/admin/components/documents/columns.tsx`
- Create: `apps/admin/components/documents/data-table.tsx`
- Create: `apps/admin/components/documents/data-table-toolbar.tsx`
- Create: `apps/admin/components/documents/data-table-pagination.tsx`

**Step 1: Create columns definition**

Create `apps/admin/components/documents/columns.tsx`:

```tsx
'use client';

import { DOCUMENT_CATEGORIES } from '@repo/shared';
import { Badge, Button } from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';

import type { DocumentWithUploader } from '@repo/database';
import type { ColumnDef } from '@tanstack/react-table';

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): { relative: string; exact: string } {
  const d = new Date(date);
  return {
    relative: formatDistanceToNow(d, { addSuffix: true, locale: hr }),
    exact: d.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

interface ColumnsProps {
  onEdit: (document: DocumentWithUploader) => void;
  onDelete: (document: DocumentWithUploader) => void;
}

export function getColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<DocumentWithUploader>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <a
            href={row.original.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline line-clamp-2"
          >
            {row.original.title}
          </a>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Kategorija',
      cell: ({ row }) => {
        const categoryKey = row.original.category as keyof typeof DOCUMENT_CATEGORIES;
        const label = DOCUMENT_CATEGORIES[categoryKey] ?? row.original.category;
        return <Badge variant="secondary">{label}</Badge>;
      },
    },
    {
      accessorKey: 'subcategory',
      header: 'Podkategorija',
      cell: ({ row }) => row.original.subcategory ?? '-',
    },
    {
      accessorKey: 'year',
      header: 'Godina',
      cell: ({ row }) => row.original.year ?? '-',
    },
    {
      accessorKey: 'fileSize',
      header: 'Veličina',
      cell: ({ row }) => formatFileSize(row.original.fileSize),
    },
    {
      accessorKey: 'createdAt',
      header: 'Dodano',
      cell: ({ row }) => {
        const { relative, exact } = formatDate(row.original.createdAt);
        return (
          <span title={exact} className="cursor-help">
            {relative}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Akcije',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Uredi
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:text-error"
            onClick={() => onDelete(row.original)}
          >
            Obriši
          </Button>
        </div>
      ),
    },
  ];
}
```

**Step 2: Create data table toolbar**

Create `apps/admin/components/documents/data-table-toolbar.tsx`:

```tsx
'use client';

import { DOCUMENT_CATEGORY_OPTIONS } from '@repo/shared';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';

interface DataTableToolbarProps {
  search: string;
  category: string;
  year: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onReset: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => currentYear + 1 - i);

export function DataTableToolbar({
  search,
  category,
  year,
  onSearchChange,
  onCategoryChange,
  onYearChange,
  onReset,
}: DataTableToolbarProps) {
  const hasFilters = search || category !== 'all' || year !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Input
        placeholder="Pretraži dokumente..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64"
      />

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Kategorija" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Sve kategorije</SelectItem>
          {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Godina" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Sve godine</SelectItem>
          {yearOptions.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" onClick={onReset}>
          Poništi filtere
        </Button>
      )}
    </div>
  );
}
```

**Step 3: Create data table pagination**

Create `apps/admin/components/documents/data-table-pagination.tsx`:

```tsx
'use client';

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';

import type { Table } from '@tanstack/react-table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span>Redaka po stranici</span>
        <Select
          value={table.getState().pagination.pageSize.toString()}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600">
          Stranica {table.getState().pagination.pageIndex + 1} od{' '}
          {table.getPageCount()}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Create data table**

Create `apps/admin/components/documents/data-table.tsx`:

```tsx
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

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

import type { ColumnDef, PaginationState } from '@tanstack/react-table';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  search: string;
  category: string;
  year: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  search,
  category,
  year,
  onSearchChange,
  onCategoryChange,
  onYearChange,
  onResetFilters,
  isLoading = false,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      onPaginationChange(newPagination);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        category={category}
        year={year}
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
        onYearChange={onYearChange}
        onReset={onResetFilters}
      />

      <div className="rounded-md border border-neutral-200">
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Učitavanje...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nema dokumenata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
```

**Step 5: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 6: Commit**

```bash
git add apps/admin/components/documents/columns.tsx apps/admin/components/documents/data-table.tsx apps/admin/components/documents/data-table-toolbar.tsx apps/admin/components/documents/data-table-pagination.tsx
git commit -m "feat(admin): add documents data table components"
```

---

## Task 10: Create Document Dialogs

**Files:**
- Create: `apps/admin/components/documents/upload-dialog.tsx`
- Create: `apps/admin/components/documents/edit-dialog.tsx`
- Create: `apps/admin/components/documents/delete-dialog.tsx`

**Step 1: Create upload dialog**

Create `apps/admin/components/documents/upload-dialog.tsx`:

```tsx
'use client';

import { useState } from 'react';

import { DOCUMENT_CATEGORY_OPTIONS } from '@repo/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';

import { DocumentUpload } from './document-upload';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => currentYear + 1 - i);

export function UploadDialog({ open, onOpenChange, onSuccess }: UploadDialogProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [year, setYear] = useState(currentYear.toString());
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    fileUrl: string;
    fileSize: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setSubcategory('');
    setYear(currentYear.toString());
    setUploadedFile(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Naslov je obavezan');
      return;
    }
    if (!category) {
      setError('Kategorija je obavezna');
      return;
    }
    if (!uploadedFile) {
      setError('PDF datoteka je obavezna');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          subcategory: subcategory.trim() || null,
          year: year ? parseInt(year, 10) : null,
          fileUrl: uploadedFile.fileUrl,
          fileSize: uploadedFile.fileSize,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (!result.success) {
        setError(result.error?.message ?? 'Greška pri spremanju dokumenta');
        return;
      }

      handleClose();
      onSuccess();
    } catch {
      setError('Greška pri spremanju dokumenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dodaj novi dokument</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Naslov *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Npr. Zapisnik 15. sjednice"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategorija *</Label>
              <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Odaberi kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Godina</Label>
              <Select value={year} onValueChange={setYear} disabled={isSubmitting}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Odaberi godinu" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Podkategorija (opcionalno)</Label>
            <Input
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="Npr. Poziv, Zapisnik, Zaključci..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>PDF datoteka *</Label>
            {uploadedFile ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">
                  Datoteka učitana ({(uploadedFile.fileSize / (1024 * 1024)).toFixed(1)} MB)
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                  disabled={isSubmitting}
                >
                  Ukloni
                </Button>
              </div>
            ) : (
              <DocumentUpload
                onUploadComplete={setUploadedFile}
                disabled={isSubmitting}
              />
            )}
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Odustani
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Spremanje...' : 'Spremi dokument'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Create edit dialog**

Create `apps/admin/components/documents/edit-dialog.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';

import { DOCUMENT_CATEGORY_OPTIONS, DOCUMENT_CATEGORIES } from '@repo/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';

import type { DocumentWithUploader } from '@repo/database';

interface EditDialogProps {
  document: DocumentWithUploader | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => currentYear + 1 - i);

export function EditDialog({ document, open, onOpenChange, onSuccess }: EditDialogProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setCategory(document.category);
      setSubcategory(document.subcategory ?? '');
      setYear(document.year?.toString() ?? '');
    }
  }, [document]);

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!document) return;

    if (!title.trim()) {
      setError('Naslov je obavezan');
      return;
    }
    if (!category) {
      setError('Kategorija je obavezna');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          subcategory: subcategory.trim() || null,
          year: year ? parseInt(year, 10) : null,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (!result.success) {
        setError(result.error?.message ?? 'Greška pri ažuriranju dokumenta');
        return;
      }

      handleClose();
      onSuccess();
    } catch {
      setError('Greška pri ažuriranju dokumenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!document) return null;

  const categoryLabel = DOCUMENT_CATEGORIES[document.category as keyof typeof DOCUMENT_CATEGORIES] ?? document.category;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Uredi dokument</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-neutral-500">
            Za zamjenu PDF-a obrišite dokument i učitajte novi.
          </p>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Naslov *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategorija *</Label>
              <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Odaberi kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-year">Godina</Label>
              <Select value={year} onValueChange={setYear} disabled={isSubmitting}>
                <SelectTrigger id="edit-year">
                  <SelectValue placeholder="Odaberi godinu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Bez godine</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subcategory">Podkategorija (opcionalno)</Label>
            <Input
              id="edit-subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Odustani
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Spremanje...' : 'Spremi promjene'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Create delete dialog**

Create `apps/admin/components/documents/delete-dialog.tsx`:

```tsx
'use client';

import { useState } from 'react';

import { DOCUMENT_CATEGORIES } from '@repo/shared';
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

import type { DocumentWithUploader } from '@repo/database';

interface DeleteDialogProps {
  document: DocumentWithUploader | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DeleteDialog({ document, open, onOpenChange, onSuccess }: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!document) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      });

      const result = (await response.json()) as { success: boolean };

      if (result.success) {
        onOpenChange(false);
        onSuccess();
      }
    } catch {
      // Error handling - could add toast notification
    } finally {
      setIsDeleting(false);
    }
  };

  if (!document) return null;

  const categoryLabel = DOCUMENT_CATEGORIES[document.category as keyof typeof DOCUMENT_CATEGORIES] ?? document.category;
  const fileSize = formatFileSize(document.fileSize);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Obrisati dokument?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Jeste li sigurni da želite obrisati ovaj dokument? Ova radnja se
                ne može poništiti.
              </p>
              <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm">
                <p className="font-medium text-neutral-900">{document.title}</p>
                <p className="text-neutral-600">
                  {categoryLabel}
                  {document.year && ` (${document.year})`}
                  {fileSize && ` - ${fileSize}`}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-error hover:bg-error/90"
          >
            {isDeleting ? 'Brisanje...' : 'Obriši'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Step 4: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 5: Commit**

```bash
git add apps/admin/components/documents/upload-dialog.tsx apps/admin/components/documents/edit-dialog.tsx apps/admin/components/documents/delete-dialog.tsx
git commit -m "feat(admin): add document upload, edit, and delete dialogs"
```

---

## Task 11: Create Documents Page

**Files:**
- Create: `apps/admin/app/(dashboard)/documents/page.tsx`

**Step 1: Create the documents page**

Create `apps/admin/app/(dashboard)/documents/page.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

import { getColumns } from '@/components/documents/columns';
import { DataTable } from '@/components/documents/data-table';
import { DeleteDialog } from '@/components/documents/delete-dialog';
import { EditDialog } from '@/components/documents/edit-dialog';
import { UploadDialog } from '@/components/documents/upload-dialog';

import type { DocumentWithUploader } from '@repo/database';
import type { PaginationState } from '@tanstack/react-table';

interface DocumentsResponse {
  success: boolean;
  data?: {
    data: DocumentWithUploader[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithUploader[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [year, setYear] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentWithUploader | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<DocumentWithUploader | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });

      if (search) params.set('search', search);
      if (category !== 'all') params.set('category', category);
      if (year !== 'all') params.set('year', year);

      const response = await fetch(`/api/documents?${params.toString()}`);
      const result = (await response.json()) as DocumentsResponse;

      if (result.success && result.data) {
        setDocuments(result.data.data);
        setPageCount(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, category, year]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleYearChange = useCallback((value: string) => {
    setYear(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setCategory('all');
    setYear('all');
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: setEditingDocument,
        onDelete: setDeletingDocument,
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dokumenti</h1>
          <p className="text-neutral-600">Upravljanje službenim dokumentima</p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          Dodaj dokument
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Svi dokumenti</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={documents}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            search={search}
            category={category}
            year={year}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onYearChange={handleYearChange}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={fetchDocuments}
      />

      <EditDialog
        document={editingDocument}
        open={!!editingDocument}
        onOpenChange={(open) => !open && setEditingDocument(null)}
        onSuccess={fetchDocuments}
      />

      <DeleteDialog
        document={deletingDocument}
        open={!!deletingDocument}
        onOpenChange={(open) => !open && setDeletingDocument(null)}
        onSuccess={fetchDocuments}
      />
    </div>
  );
}
```

**Step 2: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 3: Commit**

```bash
git add apps/admin/app/\(dashboard\)/documents/page.tsx
git commit -m "feat(admin): add documents management page"
```

---

## Task 12: Add Documents to Navigation

**Files:**
- Modify: `apps/admin/components/layout/sidebar.tsx` (or wherever nav is defined)

**Step 1: Add documents link to sidebar**

Find the navigation items array and add:

```tsx
{
  href: '/documents',
  label: 'Dokumenti',
  icon: FileText, // from lucide-react
}
```

**Step 2: Run lint**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint
```

**Step 3: Commit**

```bash
git add apps/admin/components/layout/sidebar.tsx
git commit -m "feat(admin): add documents to navigation"
```

---

## Task 13: Add API Route Tests

**Files:**
- Create: `apps/admin/app/api/documents/__tests__/route.test.ts`
- Create: `apps/admin/app/api/documents/__tests__/upload.test.ts`

**Step 1: Create CRUD route tests**

Create `apps/admin/app/api/documents/__tests__/route.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GET, POST } from '../route';

// Mock repository
vi.mock('@repo/database', () => ({
  documentsRepository: {
    findAll: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  documentsLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { documentsRepository } from '@repo/database';

const mockDocumentsRepository = vi.mocked(documentsRepository);

describe('GET /api/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated documents', async () => {
    const mockResult = {
      documents: [
        {
          id: '1',
          title: 'Test Document',
          fileUrl: 'https://example.com/doc.pdf',
          fileSize: 1024,
          category: 'sjednice',
          subcategory: null,
          year: 2024,
          uploadedBy: null,
          createdAt: new Date(),
          uploader: null,
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    mockDocumentsRepository.findAll.mockResolvedValue(mockResult);

    const request = new Request('http://localhost:3001/api/documents?page=1&limit=20');
    const response = await GET(request as any);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.data).toHaveLength(1);
    expect(data.data.pagination.total).toBe(1);
  });

  it('filters by category', async () => {
    mockDocumentsRepository.findAll.mockResolvedValue({
      documents: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const request = new Request('http://localhost:3001/api/documents?category=proracun');
    await GET(request as any);

    expect(mockDocumentsRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'proracun' })
    );
  });

  it('filters by year', async () => {
    mockDocumentsRepository.findAll.mockResolvedValue({
      documents: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const request = new Request('http://localhost:3001/api/documents?year=2024');
    await GET(request as any);

    expect(mockDocumentsRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2024 })
    );
  });
});

describe('POST /api/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates document with valid data', async () => {
    const mockDocument = {
      id: '1',
      title: 'Test Document',
      fileUrl: 'https://example.com/doc.pdf',
      fileSize: 1024,
      category: 'sjednice',
      subcategory: null,
      year: 2024,
      uploadedBy: null,
      createdAt: new Date(),
      uploader: null,
    };

    mockDocumentsRepository.create.mockResolvedValue(mockDocument);

    const request = new Request('http://localhost:3001/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Document',
        category: 'sjednice',
        year: 2024,
        fileUrl: 'https://example.com/doc.pdf',
        fileSize: 1024,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Test Document');
  });

  it('rejects invalid category', async () => {
    const request = new Request('http://localhost:3001/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Document',
        category: 'invalid_category',
        fileUrl: 'https://example.com/doc.pdf',
        fileSize: 1024,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing title', async () => {
    const request = new Request('http://localhost:3001/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'sjednice',
        fileUrl: 'https://example.com/doc.pdf',
        fileSize: 1024,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
```

**Step 2: Create upload route tests**

Create `apps/admin/app/api/documents/__tests__/upload.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '../upload/route';

// Mock R2
vi.mock('@/lib/r2', () => ({
  uploadToR2: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  documentsLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { uploadToR2 } from '@/lib/r2';
import { documentsLogger } from '@/lib/logger';

const mockUploadToR2 = vi.mocked(uploadToR2);
const mockLogger = vi.mocked(documentsLogger);

describe('POST /api/documents/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads valid PDF file', async () => {
    mockUploadToR2.mockResolvedValue('https://r2.example.com/documents/123.pdf');

    // Create valid PDF buffer (starts with %PDF-)
    const pdfContent = '%PDF-1.4 test content';
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', pdfBlob, 'test.pdf');

    const request = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.fileUrl).toBe('https://r2.example.com/documents/123.pdf');
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it('rejects non-PDF file by signature', async () => {
    // Create file that claims to be PDF but has wrong signature
    const textContent = 'This is not a PDF';
    const fakeBlob = new Blob([textContent], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', fakeBlob, 'fake.pdf');

    const request = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Datoteka nije valjani PDF');
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('rejects missing file', async () => {
    const formData = new FormData();

    const request = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Datoteka nije odabrana');
  });

  it('handles R2 upload failure', async () => {
    mockUploadToR2.mockRejectedValue(new Error('R2 connection failed'));

    const pdfContent = '%PDF-1.4 test content';
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', pdfBlob, 'test.pdf');

    const request = new Request('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
```

**Step 3: Run tests**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin && pnpm test
```

**Step 4: Commit**

```bash
git add apps/admin/app/api/documents/__tests__/route.test.ts apps/admin/app/api/documents/__tests__/upload.test.ts
git commit -m "test(admin): add documents API route tests"
```

---

## Task 14: Run Gates and Manual Testing

**Step 1: Run all gates**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check && pnpm test && pnpm build
```

**Step 2: Manual testing checklist**

Start dev server and test at http://localhost:3001/documents:

- [ ] Documents page loads with empty state
- [ ] "Dodaj dokument" button opens upload dialog
- [ ] Year defaults to current year in upload form
- [ ] PDF upload works (drag-drop and click)
- [ ] Non-PDF file shows error
- [ ] Invalid PDF signature shows error
- [ ] File > 20MB shows error
- [ ] Document creation with metadata works
- [ ] Documents appear in table after creation
- [ ] Table shows correct columns (Title, Category, Subcategory, Year, Size, Created, Actions)
- [ ] Created date shows relative time with exact date tooltip
- [ ] Category filter works
- [ ] Year filter works
- [ ] Search works
- [ ] Pagination works
- [ ] Edit dialog opens with correct data
- [ ] Edit dialog shows "Za zamjenu PDF-a..." hint
- [ ] Edit save works
- [ ] Delete dialog shows title, category, year, and size
- [ ] Delete works (file removed from R2)

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(admin): polish documents management"
```

---

## Task 15: Update Documentation

**Files:**
- Modify: `ROADMAP.md`
- Modify: `CHANGELOG.md`

**Step 1: Update ROADMAP.md**

Change Sprint 1.6 status from ⬜ to ✅:

```markdown
| 1.6 ✅ | Documents CRUD | 🔀 | 1.1 | Upload PDF, list, edit, delete |
```

Update Active Sprint to 1.7.
Update Phase 1 progress to 6/12.

**Step 2: Update CHANGELOG.md**

Add entry:

```markdown
## [Unreleased]

### Added
- Document management system with PDF upload to R2
- Document categories: sjednice, proračun, planovi, javna nabava, izbori, obrasci, odluke načelnika, strateški dokumenti, zakoni i propisi, ostalo
- Admin page for document CRUD with filtering and pagination
- PDF signature validation (%PDF- header check)
- Shared document schemas and types in @repo/shared
- Documents repository in @repo/database
```

**Step 3: Commit**

```bash
git add ROADMAP.md CHANGELOG.md
git commit -m "docs: mark Sprint 1.6 Documents complete"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add document constants and types | packages/shared/src/constants/documents.ts |
| 2 | Create validation schemas | packages/shared/src/schemas/document.ts |
| 3 | Create documents repository | packages/database/src/repositories/documents.ts |
| 4 | Add documents logger | apps/admin/lib/logger.ts |
| 5 | Create upload API route | apps/admin/app/api/documents/upload/route.ts |
| 6 | Create CRUD API routes | apps/admin/app/api/documents/*.ts |
| 7 | Create DocumentUpload component | apps/admin/components/documents/document-upload.tsx |
| 8 | Add DocumentUpload tests | apps/admin/components/documents/document-upload.test.tsx |
| 9 | Create data table components | apps/admin/components/documents/*.tsx |
| 10 | Create dialogs | apps/admin/components/documents/*-dialog.tsx |
| 11 | Create documents page | apps/admin/app/(dashboard)/documents/page.tsx |
| 12 | Add to navigation | apps/admin/components/layout/sidebar.tsx |
| 13 | Add API route tests | apps/admin/app/api/documents/__tests__/*.ts |
| 14 | Run gates and test | - |
| 15 | Update documentation | ROADMAP.md, CHANGELOG.md |

**Gate:** Upload PDF, see it in list, edit metadata, delete it

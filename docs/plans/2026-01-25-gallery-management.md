# Gallery Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build admin interface for managing photo galleries (albums) with bulk image upload, drag-drop reordering, and cover image selection.

**Architecture:** Follow events pattern for gallery CRUD. Gallery has many GalleryImages with sortOrder for reordering. Bulk upload uses existing /api/upload endpoint. Cover image is first image or manually selected.

**Tech Stack:** Next.js 16, Prisma (Gallery, GalleryImage models), R2 for images, TanStack React Table, react-beautiful-dnd for reordering, Zod validation

---

## Task 1: Add Gallery Types and Schemas to @repo/shared

**Files:**
- Create: `packages/shared/src/types/gallery.ts`
- Create: `packages/shared/src/schemas/gallery.ts`
- Modify: `packages/shared/src/types/index.ts`
- Modify: `packages/shared/src/schemas/index.ts`

**Step 1: Write Gallery types**

```typescript
// packages/shared/src/types/gallery.ts
export interface GalleryImage {
  id: string;
  galleryId: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface Gallery {
  id: string;
  name: string;
  slug: string;
  eventDate: Date | null;
  description: string | null;
  coverImage: string | null;
  createdAt: Date;
}

export interface GalleryWithImages extends Gallery {
  images: GalleryImage[];
  _count?: { images: number };
}
```

**Step 2: Write Gallery Zod schemas**

```typescript
// packages/shared/src/schemas/gallery.ts
import { z } from 'zod';

export const gallerySchema = z.object({
  name: z
    .string()
    .min(2, 'Naziv mora imati najmanje 2 znaka')
    .max(200, 'Naziv može imati najviše 200 znakova'),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  eventDate: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  coverImage: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export const createGallerySchema = gallerySchema;
export const updateGallerySchema = gallerySchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;

export const galleryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'eventDate', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GalleryQueryInput = z.infer<typeof galleryQuerySchema>;

// Schema for updating image order
export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string().uuid()),
});

export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;

// Schema for adding images to gallery
export const addGalleryImagesSchema = z.object({
  images: z.array(
    z.object({
      imageUrl: z.string().url(),
      thumbnailUrl: z.string().url().nullable().optional(),
      caption: z.string().nullable().optional(),
    })
  ),
});

export type AddGalleryImagesInput = z.infer<typeof addGalleryImagesSchema>;
```

**Step 3: Export from index files**

Add to `packages/shared/src/types/index.ts`:
```typescript
export type { Gallery, GalleryImage, GalleryWithImages } from './gallery';
```

Add to `packages/shared/src/schemas/index.ts`:
```typescript
export {
  gallerySchema,
  createGallerySchema,
  updateGallerySchema,
  galleryQuerySchema,
  reorderImagesSchema,
  addGalleryImagesSchema,
  type CreateGalleryInput,
  type UpdateGalleryInput,
  type GalleryQueryInput,
  type ReorderImagesInput,
  type AddGalleryImagesInput,
} from './gallery';
```

**Step 4: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/shared/src/types/gallery.ts packages/shared/src/schemas/gallery.ts packages/shared/src/types/index.ts packages/shared/src/schemas/index.ts
git commit -m "feat(shared): add Gallery types and Zod schemas"
```

---

## Task 2: Create Galleries Repository in @repo/database

**Files:**
- Create: `packages/database/src/repositories/galleries.ts`
- Modify: `packages/database/src/repositories/index.ts`

**Step 1: Write Galleries repository**

```typescript
// packages/database/src/repositories/galleries.ts
import { db } from '../client';

import type { Gallery, GalleryImage, Prisma } from '@prisma/client';

export interface GalleryWithImages extends Gallery {
  images: GalleryImage[];
  _count: { images: number };
}

export interface GalleryWithCount extends Gallery {
  _count: { images: number };
}

export interface FindAllGalleriesOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  sortBy?: 'createdAt' | 'eventDate' | 'name' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FindAllGalleriesResult {
  galleries: GalleryWithCount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateGalleryData {
  name: string;
  slug: string;
  description?: string | null;
  eventDate?: Date | null;
  coverImage?: string | null;
}

export interface UpdateGalleryData {
  name?: string;
  slug?: string;
  description?: string | null;
  eventDate?: Date | null;
  coverImage?: string | null;
}

export interface AddImageData {
  imageUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
}

export const galleriesRepository = {
  async findAll(options: FindAllGalleriesOptions = {}): Promise<FindAllGalleriesResult> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: Prisma.GalleryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, galleries] = await Promise.all([
      db.gallery.count({ where }),
      db.gallery.findMany({
        where,
        include: { _count: { select: { images: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      galleries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<GalleryWithImages | null> {
    return db.gallery.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { images: true } },
      },
    });
  },

  async findBySlug(slug: string): Promise<GalleryWithImages | null> {
    return db.gallery.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { images: true } },
      },
    });
  },

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.GalleryWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await db.gallery.count({ where });
    return count > 0;
  },

  async create(data: CreateGalleryData): Promise<GalleryWithImages> {
    return db.gallery.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        eventDate: data.eventDate ?? null,
        coverImage: data.coverImage ?? null,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { images: true } },
      },
    });
  },

  async update(id: string, data: UpdateGalleryData): Promise<GalleryWithImages> {
    return db.gallery.update({
      where: { id },
      data,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { images: true } },
      },
    });
  },

  async delete(id: string): Promise<Gallery> {
    // Images are cascade deleted by Prisma
    return db.gallery.delete({ where: { id } });
  },

  async exists(id: string): Promise<boolean> {
    const count = await db.gallery.count({ where: { id } });
    return count > 0;
  },

  // Image operations
  async addImages(galleryId: string, images: AddImageData[]): Promise<GalleryImage[]> {
    // Get current max sortOrder
    const maxOrder = await db.galleryImage.aggregate({
      where: { galleryId },
      _max: { sortOrder: true },
    });
    const startOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const created = await db.$transaction(
      images.map((img, index) =>
        db.galleryImage.create({
          data: {
            galleryId,
            imageUrl: img.imageUrl,
            thumbnailUrl: img.thumbnailUrl ?? null,
            caption: img.caption ?? null,
            sortOrder: startOrder + index,
          },
        })
      )
    );

    return created;
  },

  async updateImageCaption(imageId: string, caption: string | null): Promise<GalleryImage> {
    return db.galleryImage.update({
      where: { id: imageId },
      data: { caption },
    });
  },

  async deleteImage(imageId: string): Promise<GalleryImage> {
    return db.galleryImage.delete({ where: { id: imageId } });
  },

  async reorderImages(galleryId: string, imageIds: string[]): Promise<void> {
    await db.$transaction(
      imageIds.map((id, index) =>
        db.galleryImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );
  },

  async getImageById(imageId: string): Promise<GalleryImage | null> {
    return db.galleryImage.findUnique({ where: { id: imageId } });
  },
};
```

**Step 2: Export from index**

Add to `packages/database/src/repositories/index.ts`:
```typescript
export {
  galleriesRepository,
  type GalleryWithImages,
  type GalleryWithCount,
  type FindAllGalleriesOptions,
  type FindAllGalleriesResult,
  type CreateGalleryData,
  type UpdateGalleryData,
  type AddImageData,
} from './galleries';
```

**Step 3: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/database/src/repositories/galleries.ts packages/database/src/repositories/index.ts
git commit -m "feat(database): add galleries repository with image management"
```

---

## Task 3: Create Galleries API Routes

**Files:**
- Create: `apps/admin/app/api/galleries/route.ts`
- Create: `apps/admin/app/api/galleries/[id]/route.ts`
- Create: `apps/admin/app/api/galleries/[id]/images/route.ts`
- Create: `apps/admin/app/api/galleries/[id]/images/[imageId]/route.ts`
- Create: `apps/admin/app/api/galleries/[id]/reorder/route.ts`
- Create: `apps/admin/lib/validations/gallery.ts`
- Modify: `apps/admin/lib/logger.ts`

**Step 1: Create gallery validation schema**

```typescript
// apps/admin/lib/validations/gallery.ts
import { z } from 'zod';

export const galleryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Naziv mora imati najmanje 2 znaka')
    .max(200, 'Naziv može imati najviše 200 znakova'),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  eventDate: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  coverImage: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export const createGallerySchema = galleryFormSchema;
export const updateGallerySchema = galleryFormSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;

export const galleryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'eventDate', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string().uuid()),
});

export const addGalleryImagesSchema = z.object({
  images: z.array(
    z.object({
      imageUrl: z.string().url(),
      thumbnailUrl: z.string().url().nullable().optional(),
      caption: z.string().nullable().optional(),
    })
  ),
});

export const updateImageCaptionSchema = z.object({
  caption: z.string().nullable(),
});
```

**Step 2: Add galleriesLogger to logger file**

Add to `apps/admin/lib/logger.ts`:
```typescript
export const galleriesLogger = logger.child({ module: 'galleries' });
```

**Step 3: Create GET/POST /api/galleries route**

Follow events pattern - list with pagination/search, create with slug generation.

**Step 4: Create GET/PUT/DELETE /api/galleries/[id] route**

Follow events pattern - get single, update (regenerate slug on name change), delete with R2 cleanup for all images.

**Step 5: Create POST /api/galleries/[id]/images route**

Add images to gallery (bulk upload).

**Step 6: Create DELETE /api/galleries/[id]/images/[imageId] route**

Delete single image with R2 cleanup.

**Step 7: Create PUT /api/galleries/[id]/reorder route**

Reorder images by passing array of imageIds.

**Step 8: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 9: Commit**

```bash
git add apps/admin/app/api/galleries apps/admin/lib/validations/gallery.ts apps/admin/lib/logger.ts
git commit -m "feat(admin): add galleries API routes with image management"
```

---

## Task 4: Create Gallery List Components

**Files:**
- Create: `apps/admin/components/galleries/columns.tsx`
- Create: `apps/admin/components/galleries/data-table.tsx`
- Create: `apps/admin/components/galleries/data-table-toolbar.tsx`
- Create: `apps/admin/components/galleries/data-table-pagination.tsx`
- Create: `apps/admin/components/galleries/delete-dialog.tsx`
- Create: `apps/admin/components/galleries/index.ts`

**Step 1: Create columns definition**

- Cover image thumbnail (or placeholder)
- Name (linked to edit/manage page)
- Image count badge
- Event date (formatted, optional)
- Created date
- Actions dropdown (Edit, Delete)

**Step 2-5: Create DataTable, Toolbar, Pagination, DeleteDialog**

Follow events pattern exactly.

**Step 6: Create index export**

**Step 7: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 8: Commit**

```bash
git add apps/admin/components/galleries
git commit -m "feat(admin): add gallery list components"
```

---

## Task 5: Create GalleryForm Component

**Files:**
- Create: `apps/admin/components/galleries/gallery-form.tsx`
- Modify: `apps/admin/components/galleries/index.ts`

**Step 1: Create GalleryForm component**

- Name input (required)
- Description textarea (optional)
- Event date picker (optional)
- Cover image selector (from gallery images or upload)
- Use react-hook-form with zodResolver
- Handle form submit void wrapping

**Step 2: Export from index**

**Step 3: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add apps/admin/components/galleries/gallery-form.tsx apps/admin/components/galleries/index.ts
git commit -m "feat(admin): add GalleryForm component"
```

---

## Task 6: Create Gallery Image Manager Component

**Files:**
- Create: `apps/admin/components/galleries/image-manager.tsx`
- Create: `apps/admin/components/galleries/image-grid.tsx`
- Create: `apps/admin/components/galleries/image-upload-zone.tsx`
- Modify: `apps/admin/components/galleries/index.ts`

**Step 1: Create ImageUploadZone component**

- Drag-drop zone for multiple images
- Shows upload progress
- Calls /api/upload for each image, then POST /api/galleries/[id]/images

**Step 2: Create ImageGrid component**

- Grid display of gallery images
- Drag-drop reordering (use @dnd-kit/core or simple drag handlers)
- Click to edit caption
- Delete button on each image
- "Set as cover" button

**Step 3: Create ImageManager component**

- Combines ImageUploadZone and ImageGrid
- Manages state for images
- Handles reorder API calls

**Step 4: Export from index**

**Step 5: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/admin/components/galleries/image-manager.tsx apps/admin/components/galleries/image-grid.tsx apps/admin/components/galleries/image-upload-zone.tsx apps/admin/components/galleries/index.ts
git commit -m "feat(admin): add gallery image manager with drag-drop reordering"
```

---

## Task 7: Create Galleries Routes (List, New, Edit/Manage)

**Files:**
- Create: `apps/admin/app/(dashboard)/galleries/page.tsx`
- Create: `apps/admin/app/(dashboard)/galleries/galleries-list.tsx`
- Create: `apps/admin/app/(dashboard)/galleries/new/page.tsx`
- Create: `apps/admin/app/(dashboard)/galleries/[id]/page.tsx` (edit + manage images)

**Step 1: Create galleries list page**

Follow events pattern with Suspense and skeleton.

**Step 2: Create galleries list component with URL state**

Follow events pattern.

**Step 3: Create new gallery route**

Simple form for creating gallery (no images yet).

**Step 4: Create edit/manage gallery route**

- Server component fetching gallery with images
- Two sections: Gallery details form + Image manager
- Tabbed or stacked layout

**Step 5: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/admin/app/\(dashboard\)/galleries
git commit -m "feat(admin): add galleries routes (list, new, edit/manage)"
```

---

## Task 8: Verify Navigation (Already Added)

The navigation already has "Galerija" link at `/galleries`. Verify it works.

**Step 1: Verify navigation link exists**

Check `apps/admin/config/navigation.ts` for galleries link.

**Step 2: Run type-check and lint**

Run: `pnpm type-check && pnpm lint`
Expected: PASS (warnings OK)

**Step 3: Commit if changes needed**

---

## Task 9: Add API Route Tests

**Files:**
- Create: `apps/admin/app/api/galleries/route.test.ts`

**Step 1: Create API tests**

Test GET pagination, POST creation, validation.

**Step 2: Run tests**

Run: `pnpm test`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/app/api/galleries/route.test.ts
git commit -m "test(admin): add galleries API route tests"
```

---

## Task 10: Update CHANGELOG and ROADMAP

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

**Step 1: Add Sprint 1.9 entry to CHANGELOG**

```markdown
## Sprint 1.9 - Gallery Management (Completed)

### Added
- Galleries repository in @repo/database with image management
- Gallery and GalleryImage types and Zod schemas in @repo/shared
- Galleries API routes (CRUD, image upload, reorder, delete)
- Galleries list page with DataTable
- GalleryForm component for gallery metadata
- ImageManager component with drag-drop reordering and bulk upload
- Create/edit gallery routes with image management
- API route tests for galleries endpoints
- Gate: Create album, bulk upload images, reorder images, set cover, delete
```

**Step 2: Update ROADMAP**

- Change 1.9 from ⬜ to ✅
- Update progress to 9/12
- Set active sprint to 1.10

**Step 3: Commit**

```bash
git add CHANGELOG.md ROADMAP.md
git commit -m "docs: complete Sprint 1.9 - Gallery management"
```

---

## Task 11: Final Verification

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

1. Navigate to /galleries
2. Create new gallery with name and optional date
3. Go to gallery edit page
4. Upload multiple images via drag-drop
5. Reorder images by dragging
6. Set cover image
7. Edit image caption
8. Delete an image
9. Delete the gallery

**Gate:** Create album, bulk upload images, reorder images, set cover, delete album (all images cleaned from R2)

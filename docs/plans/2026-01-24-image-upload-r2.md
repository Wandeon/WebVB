# Sprint 1.5: Image Upload (R2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add image upload capability for post featured images with Cloudflare R2 storage.

**Architecture:** Reusable ImageUpload component in `@repo/ui`, API route for upload/delete, Sharp for image processing, R2 for storage. Three image variants: thumb (150px), medium (800px), large (1920px).

**Tech Stack:** @aws-sdk/client-s3 (R2), Sharp, React dropzone

---

## Task 1: Add Dependencies

**Files:**
- Modify: `apps/admin/package.json`

**Step 1: Install dependencies in admin app**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin && pnpm add @aws-sdk/client-s3 sharp
```

**Step 2: Install sharp types**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin && pnpm add -D @types/sharp
```

**Step 3: Install from root**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm install
```

**Step 4: Commit**

```bash
git add apps/admin/package.json pnpm-lock.yaml
git commit -m "chore(admin): add R2 and Sharp dependencies"
```

---

## Task 2: Create R2 Client

**Files:**
- Create: `apps/admin/lib/r2.ts`
- Modify: `.env.example`

**Step 1: Update .env.example with R2 variables**

Add to `.env.example`:

```env
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=velikibukovec
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

**Step 2: Create R2 client**

Create `apps/admin/lib/r2.ts`:

```ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${publicUrl}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

export function getR2KeyFromUrl(url: string): string | null {
  if (!url.startsWith(publicUrl)) return null;
  return url.replace(`${publicUrl}/`, '');
}
```

**Step 3: Run type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm type-check
```

**Step 4: Commit**

```bash
git add apps/admin/lib/r2.ts .env.example
git commit -m "feat(admin): add R2 client configuration"
```

---

## Task 3: Create Upload API Route

**Files:**
- Create: `apps/admin/app/api/upload/route.ts`

**Step 1: Create the upload API route**

Create `apps/admin/app/api/upload/route.ts`:

```ts
import { randomUUID } from 'crypto';

import sharp from 'sharp';

import { apiError, apiSuccess, ErrorCodes } from '@/lib/api-response';
import { postsLogger } from '@/lib/logger';
import { deleteFromR2, getR2KeyFromUrl, uploadToR2 } from '@/lib/r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageVariants {
  id: string;
  thumb: string;
  medium: string;
  large: string;
}

async function processAndUpload(
  buffer: Buffer,
  id: string
): Promise<ImageVariants> {
  const sharpInstance = sharp(buffer);

  // Generate variants
  const [thumbBuffer, mediumBuffer, largeBuffer] = await Promise.all([
    sharpInstance.clone().resize(150, 150, { fit: 'cover' }).webp({ quality: 80 }).toBuffer(),
    sharpInstance.clone().resize(800, null, { withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
    sharpInstance.clone().resize(1920, null, { withoutEnlargement: true }).webp({ quality: 90 }).toBuffer(),
  ]);

  // Upload all variants
  const [thumbUrl, mediumUrl, largeUrl] = await Promise.all([
    uploadToR2(`uploads/${id}/thumb.webp`, thumbBuffer, 'image/webp'),
    uploadToR2(`uploads/${id}/medium.webp`, mediumBuffer, 'image/webp'),
    uploadToR2(`uploads/${id}/large.webp`, largeBuffer, 'image/webp'),
  ]);

  return {
    id,
    thumb: thumbUrl,
    medium: mediumUrl,
    large: largeUrl,
  };
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

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Dozvoljeni formati: JPEG, PNG, WebP, GIF',
        400
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Maksimalna veličina je 10MB',
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = randomUUID();

    const variants = await processAndUpload(buffer, id);

    postsLogger.info({ imageId: id }, 'Image uploaded successfully');

    return apiSuccess(variants);
  } catch (error) {
    postsLogger.error({ error }, 'Failed to upload image');
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      'Greška pri učitavanju slike',
      500
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'ID slike je obavezan', 400);
    }

    // Delete all variants
    await Promise.all([
      deleteFromR2(`uploads/${id}/thumb.webp`),
      deleteFromR2(`uploads/${id}/medium.webp`),
      deleteFromR2(`uploads/${id}/large.webp`),
    ]);

    postsLogger.info({ imageId: id }, 'Image deleted successfully');

    return apiSuccess({ deleted: true });
  } catch (error) {
    postsLogger.error({ error }, 'Failed to delete image');
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Greška pri brisanju slike', 500);
  }
}
```

**Step 2: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 3: Commit**

```bash
git add apps/admin/app/api/upload/route.ts
git commit -m "feat(admin): add image upload API with Sharp processing"
```

---

## Task 4: Create ImageUpload Component

**Files:**
- Create: `packages/ui/src/components/ui/image-upload.tsx`
- Create: `packages/ui/src/components/ui/image-upload.test.tsx`
- Modify: `packages/ui/src/components/ui/index.ts`

**Step 1: Create the ImageUpload component**

Create `packages/ui/src/components/ui/image-upload.tsx`:

```tsx
'use client';

import { useCallback, useState } from 'react';

import { cn } from '../../lib/utils';

export interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Dozvoljeni formati: JPEG, PNG, WebP, GIF';
    }
    if (file.size > MAX_SIZE) {
      return 'Maksimalna veličina je 10MB';
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

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = (await response.json()) as {
          success: boolean;
          data?: { medium: string };
          error?: { message: string };
        };

        if (!result.success) {
          setError(result.error?.message ?? 'Greška pri učitavanju');
          return;
        }

        if (result.data?.medium) {
          onChange(result.data.medium);
        }
      } catch {
        setError('Greška pri učitavanju slike');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
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
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [uploadFile]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove();
    },
    [onRemove]
  );

  // Show preview if we have an image
  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <img
          src={value}
          alt="Uploaded"
          className="w-full h-48 object-cover rounded-lg border border-neutral-200"
        />
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-full',
            'bg-black/50 text-white hover:bg-black/70',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'disabled:cursor-not-allowed'
          )}
          aria-label="Ukloni sliku"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-full h-48 border-2 border-dashed rounded-lg cursor-pointer',
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
          accept={ALLOWED_TYPES.join(',')}
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div>
              <span className="text-sm font-medium text-primary-600">
                Kliknite za odabir
              </span>
              <span className="text-sm text-neutral-500">
                {' '}
                ili povucite sliku
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              JPEG, PNG, WebP ili GIF (max 10MB)
            </span>
          </div>
        )}
      </label>

      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
```

**Step 2: Create tests**

Create `packages/ui/src/components/ui/image-upload.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ImageUpload } from './image-upload';

describe('ImageUpload', () => {
  it('renders drop zone when no value', () => {
    render(<ImageUpload value={null} onChange={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Kliknite za odabir')).toBeInTheDocument();
    expect(screen.getByText(/povucite sliku/)).toBeInTheDocument();
  });

  it('renders image preview when value provided', () => {
    render(
      <ImageUpload
        value="https://example.com/image.jpg"
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/image.jpg'
    );
  });

  it('shows remove button on image preview', () => {
    render(
      <ImageUpload
        value="https://example.com/image.jpg"
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Ukloni sliku')).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn();
    render(
      <ImageUpload
        value="https://example.com/image.jpg"
        onChange={vi.fn()}
        onRemove={onRemove}
      />
    );
    fireEvent.click(screen.getByLabelText('Ukloni sliku'));
    expect(onRemove).toHaveBeenCalled();
  });

  it('shows file type hint', () => {
    render(<ImageUpload value={null} onChange={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(/JPEG, PNG, WebP ili GIF/)).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <ImageUpload
        value={null}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        disabled
      />
    );
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
  });
});
```

**Step 3: Export from index**

Add to `packages/ui/src/components/ui/index.ts`:

```ts
export { ImageUpload, type ImageUploadProps } from './image-upload';
```

**Step 4: Run tests**

```bash
cd /mnt/c/VelikiBukovec_web/packages/ui && pnpm test
```

**Step 5: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 6: Commit**

```bash
git add packages/ui/src/components/ui/image-upload.tsx packages/ui/src/components/ui/image-upload.test.tsx packages/ui/src/components/ui/index.ts
git commit -m "feat(ui): add ImageUpload component with drag-drop"
```

---

## Task 5: Add Featured Image to Post Schema

**Files:**
- Modify: `packages/database/prisma/schema.prisma` (verify field exists)
- Modify: `apps/admin/lib/validations/post.ts`
- Modify: `apps/admin/lib/validations/post.test.ts`

**Step 1: Verify schema has featuredImage field**

The Prisma schema should already have `featuredImage` field. Verify it exists in the Post model.

**Step 2: Update validation schema**

In `apps/admin/lib/validations/post.ts`, add `featuredImage` to the schema:

```ts
export const postSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 znaka')
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
  excerpt: z.string().max(500, 'Sažetak može imati najviše 500 znakova').optional(),
  category: z.enum(categoryKeys),
  isFeatured: z.boolean(),
  featuredImage: z.string().url().nullable().optional(),
  publishedAt: z.date().nullable().optional(),
});
```

**Step 3: Add tests**

Add to `apps/admin/lib/validations/post.test.ts`:

```ts
describe('featuredImage', () => {
  it('accepts valid URL', () => {
    const result = postSchema.safeParse({
      title: 'Test naslov',
      content: '<p>Content</p>',
      category: 'aktualnosti',
      isFeatured: false,
      featuredImage: 'https://example.com/image.webp',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null', () => {
    const result = postSchema.safeParse({
      title: 'Test naslov',
      content: '<p>Content</p>',
      category: 'aktualnosti',
      isFeatured: false,
      featuredImage: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL', () => {
    const result = postSchema.safeParse({
      title: 'Test naslov',
      content: '<p>Content</p>',
      category: 'aktualnosti',
      isFeatured: false,
      featuredImage: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 4: Run tests**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin && pnpm test
```

**Step 5: Commit**

```bash
git add apps/admin/lib/validations/post.ts apps/admin/lib/validations/post.test.ts
git commit -m "feat(admin): add featuredImage to post validation schema"
```

---

## Task 6: Integrate ImageUpload in Post Form

**Files:**
- Modify: `apps/admin/components/posts/post-form.tsx`

**Step 1: Add ImageUpload to imports**

```tsx
import {
  // ... existing imports
  ImageUpload,
} from '@repo/ui';
```

**Step 2: Add featuredImage to form types and defaults**

Update `PostFormData` interface:

```tsx
interface PostFormData {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  category: PostCategory;
  isFeatured: boolean;
  featuredImage?: string | null;
  publishedAt?: Date | null;
}
```

Update defaultValues:

```tsx
defaultValues: {
  title: initialData?.title ?? '',
  content: initialData?.content ?? '',
  excerpt: initialData?.excerpt ?? '',
  category: initialData?.category ?? 'aktualnosti',
  isFeatured: initialData?.isFeatured ?? false,
  featuredImage: initialData?.featuredImage ?? null,
  publishedAt: initialData?.publishedAt ?? null,
},
```

**Step 3: Add ImageUpload to form JSX**

Add after the content TipTap editor section, before closing the Card:

```tsx
{/* Featured Image */}
<div className="space-y-2">
  <Label htmlFor="featuredImage">Naslovna slika</Label>
  <ImageUpload
    value={watch('featuredImage')}
    onChange={(url) => setValue('featuredImage', url)}
    onRemove={() => setValue('featuredImage', null)}
    disabled={isSubmitting}
  />
</div>
```

**Step 4: Run type-check and lint**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 5: Commit**

```bash
git add apps/admin/components/posts/post-form.tsx
git commit -m "feat(admin): integrate ImageUpload in post form"
```

---

## Task 7: Update Post API Routes

**Files:**
- Modify: `apps/admin/app/api/posts/route.ts`
- Modify: `apps/admin/app/api/posts/[id]/route.ts`

**Step 1: Update POST route to include featuredImage**

In the POST handler, ensure `featuredImage` is passed to the repository:

```ts
const post = await postsRepository.create({
  title: validated.title,
  slug,
  content: validated.content,
  excerpt: validated.excerpt,
  category: validated.category,
  isFeatured: validated.isFeatured,
  featuredImage: validated.featuredImage ?? null,
  publishedAt: validated.publishedAt,
  authorId: null,
});
```

**Step 2: Update PUT route to include featuredImage**

In the PUT handler, include `featuredImage` in the update:

```ts
const post = await postsRepository.update(id, {
  title: validated.title,
  slug: validated.slug,
  content: validated.content,
  excerpt: validated.excerpt,
  category: validated.category,
  isFeatured: validated.isFeatured,
  featuredImage: validated.featuredImage,
  publishedAt: validated.publishedAt,
});
```

**Step 3: Update repository types if needed**

Ensure `CreatePostData` and `UpdatePostData` in `packages/database/src/repositories/posts.ts` include `featuredImage`:

```ts
export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  category: string;
  isFeatured: boolean;
  featuredImage?: string | null;
  publishedAt?: Date | null;
  authorId?: string | null;
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  category?: string;
  isFeatured?: boolean;
  featuredImage?: string | null;
  publishedAt?: Date | null;
}
```

**Step 4: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

**Step 5: Commit**

```bash
git add apps/admin/app/api/posts/route.ts apps/admin/app/api/posts/[id]/route.ts packages/database/src/repositories/posts.ts
git commit -m "feat(admin): support featuredImage in post API routes"
```

---

## Task 8: Run Gates and Manual Testing

**Step 1: Run all gates**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check && pnpm test && pnpm build
```

**Step 2: Manual testing checklist**

Start dev server and test at http://localhost:3001/posts/new:

- [ ] Drop zone renders in post form
- [ ] Click to select file works
- [ ] Drag and drop works
- [ ] Invalid file type shows error
- [ ] File > 10MB shows error
- [ ] Upload shows loading spinner
- [ ] After upload, preview shows
- [ ] Remove button deletes image
- [ ] Save post with image works
- [ ] Edit post shows existing image
- [ ] Image persists after save

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(admin): polish image upload integration"
```

---

## Task 9: Update Documentation

**Files:**
- Modify: `ROADMAP.md`
- Modify: `CHANGELOG.md`

**Step 1: Update ROADMAP.md**

Change Sprint 1.5 status from ⬜ to ✅:

```markdown
| 1.5 ✅ | Image upload (R2) | 🔀 | 1.1 | Upload image, get R2 URL, display |
```

Update Active Sprint to 1.6.
Update Phase 1 progress to 5/12.

**Step 2: Update CHANGELOG.md**

Add entry:

```markdown
## [Unreleased]

### Added
- Image upload component with drag-drop support in @repo/ui
- Image upload API with Sharp processing (thumb, medium, large variants)
- Cloudflare R2 integration for image storage
- Featured image field in post form
```

**Step 3: Commit**

```bash
git add ROADMAP.md CHANGELOG.md
git commit -m "docs: mark Sprint 1.5 Image upload complete"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add dependencies | apps/admin/package.json |
| 2 | Create R2 client | apps/admin/lib/r2.ts |
| 3 | Create upload API | apps/admin/app/api/upload/route.ts |
| 4 | Create ImageUpload component | packages/ui/.../image-upload.tsx |
| 5 | Add to post schema | apps/admin/lib/validations/post.ts |
| 6 | Integrate in post form | apps/admin/.../post-form.tsx |
| 7 | Update post API routes | apps/admin/app/api/posts/*.ts |
| 8 | Run gates and test | - |
| 9 | Update documentation | ROADMAP.md, CHANGELOG.md |

**Gate:** Upload image, see thumbnail, delete it

# Sprint 1.4: TipTap Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Textarea placeholder in the post form with a rich text TipTap editor.

**Architecture:** Reusable TipTapEditor component in `@repo/ui` package, integrated with React Hook Form in post-form.tsx. Editor outputs HTML string, stored in existing `content` field.

**Tech Stack:** TipTap (React), StarterKit extensions, Tailwind for styling

---

## Task 1: Install TipTap Dependencies

**Files:**
- Modify: `packages/ui/package.json`

**Step 1: Add TipTap packages to UI package**

```bash
cd /mnt/c/VelikiBukovec_web/packages/ui && pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-underline @tiptap/extension-placeholder
```

**Step 2: Verify installation**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm install
```

Expected: No errors, lock file updated.

**Step 3: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "chore: add TipTap dependencies to UI package"
```

---

## Task 2: Create TipTapEditor Component

**Files:**
- Create: `packages/ui/src/components/ui/tiptap-editor.tsx`
- Modify: `packages/ui/src/components/ui/index.ts`

**Step 1: Write the failing test**

Create `packages/ui/src/components/ui/tiptap-editor.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TipTapEditor } from './tiptap-editor';

describe('TipTapEditor', () => {
  it('renders with placeholder', () => {
    render(
      <TipTapEditor
        value=""
        onChange={vi.fn()}
        placeholder="Enter content..."
      />
    );
    expect(screen.getByText('Enter content...')).toBeInTheDocument();
  });

  it('renders toolbar buttons', () => {
    render(<TipTapEditor value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Bold')).toBeInTheDocument();
    expect(screen.getByLabelText('Italic')).toBeInTheDocument();
    expect(screen.getByLabelText('Underline')).toBeInTheDocument();
    expect(screen.getByLabelText('Link')).toBeInTheDocument();
  });

  it('applies error styling when error prop is true', () => {
    render(<TipTapEditor value="" onChange={vi.fn()} error />);
    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('border-error');
  });

  it('calls onChange with HTML when content changes', async () => {
    const onChange = vi.fn();
    render(<TipTapEditor value="" onChange={onChange} />);
    // TipTap initializes and may call onChange
    // Full interaction tests would use userEvent
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/VelikiBukovec_web/packages/ui && pnpm test
```

Expected: FAIL - module not found.

**Step 3: Create the TipTapEditor component**

Create `packages/ui/src/components/ui/tiptap-editor.tsx`:

```tsx
'use client';

import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

import { cn } from '../../lib/utils';

export interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = '',
  error = false,
  className,
}: TipTapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Treat empty paragraph as empty string
      const isEmpty = html === '<p></p>' || html === '';
      onChange(isEmpty ? '' : html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none',
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="h-[350px] animate-pulse rounded-md border bg-neutral-50" />
    );
  }

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
  };

  return (
    <div
      className={cn(
        'rounded-md border bg-white',
        error ? 'border-error' : 'border-neutral-200',
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 p-2">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          aria-label="Bold"
          title="Bold (Ctrl+B)"
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          aria-label="Italic"
          title="Italic (Ctrl+I)"
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          aria-label="Underline"
          title="Underline (Ctrl+U)"
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            active={editor.isActive('link')}
            aria-label="Link"
            title="Add link"
          >
            🔗
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded border bg-white p-2 shadow-lg">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-48 rounded border px-2 py-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <button
                type="button"
                onClick={addLink}
                className="rounded bg-primary-600 px-2 py-1 text-sm text-white hover:bg-primary-700"
              >
                Dodaj
              </button>
              {editor.isActive('link') && (
                <button
                  type="button"
                  onClick={removeLink}
                  className="rounded bg-error px-2 py-1 text-sm text-white hover:bg-red-700"
                >
                  Ukloni
                </button>
              )}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          aria-label="Heading 2"
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          aria-label="Heading 3"
          title="Heading 3"
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          active={editor.isActive('heading', { level: 4 })}
          aria-label="Heading 4"
          title="Heading 4"
        >
          H4
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists & blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          aria-label="Bullet list"
          title="Bullet list"
        >
          •
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          aria-label="Ordered list"
          title="Numbered list"
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          aria-label="Blockquote"
          title="Quote"
        >
          ❝
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  'aria-label': string;
  title?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
  'aria-label': ariaLabel,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded text-sm transition-colors',
        active
          ? 'bg-primary-100 text-primary-700'
          : 'text-neutral-600 hover:bg-neutral-100'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-neutral-300" />;
}
```

**Step 4: Export from index**

Add to `packages/ui/src/components/ui/index.ts`:

```ts
export { TipTapEditor, type TipTapEditorProps } from './tiptap-editor';
```

**Step 5: Run tests**

```bash
cd /mnt/c/VelikiBukovec_web/packages/ui && pnpm test
```

Expected: Tests pass.

**Step 6: Run lint and type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check
```

Expected: No errors.

**Step 7: Commit**

```bash
git add packages/ui/src/components/ui/tiptap-editor.tsx packages/ui/src/components/ui/tiptap-editor.test.tsx packages/ui/src/components/ui/index.ts
git commit -m "feat(ui): add TipTapEditor component with toolbar"
```

---

## Task 3: Add Vitest to UI Package

**Files:**
- Modify: `packages/ui/package.json`
- Create: `packages/ui/vitest.config.ts`
- Create: `packages/ui/vitest.setup.ts`

**Step 1: Install test dependencies**

```bash
cd /mnt/c/VelikiBukovec_web/packages/ui && pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

**Step 2: Create vitest config**

Create `packages/ui/vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    globals: true,
  },
});
```

**Step 3: Create vitest setup**

Create `packages/ui/vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

**Step 4: Add test script to package.json**

Add to `packages/ui/package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Run tests to verify setup**

```bash
cd /mnt/c/VelikiBukovec_web/packages/ui && pnpm test
```

Expected: Tests run (may fail until Task 2 component exists).

**Step 6: Commit**

```bash
git add packages/ui/package.json packages/ui/vitest.config.ts packages/ui/vitest.setup.ts pnpm-lock.yaml
git commit -m "chore(ui): add vitest test configuration"
```

---

## Task 4: Integrate TipTapEditor in Post Form

**Files:**
- Modify: `apps/admin/components/posts/post-form.tsx`

**Step 1: Update imports**

In `apps/admin/components/posts/post-form.tsx`, update imports:

```tsx
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
  Textarea,
  TipTapEditor,  // Add this
  toast,
} from '@repo/ui';
```

**Step 2: Replace Textarea with TipTapEditor**

Replace lines 187-202 (the content Textarea section) with:

```tsx
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
    placeholder="Unesite sadržaj objave..."
    error={Boolean(errors.content)}
  />
  {errors.content && (
    <p className="text-sm text-error">{errors.content.message}</p>
  )}
</div>
```

**Step 3: Remove unused Textarea import**

Remove `Textarea` from the imports if no longer used elsewhere.

**Step 4: Run type-check**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm type-check
```

Expected: No errors.

**Step 5: Run lint**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint
```

Expected: No errors (or only existing warnings).

**Step 6: Commit**

```bash
git add apps/admin/components/posts/post-form.tsx
git commit -m "feat(admin): integrate TipTap editor in post form"
```

---

## Task 5: Update Content Validation

**Files:**
- Modify: `apps/admin/lib/validations/post.ts`
- Modify: `apps/admin/lib/validations/post.test.ts`

**Step 1: Update validation to handle HTML content**

The current validation `z.string().min(1, 'Sadržaj je obavezan')` should work, but add a refinement to catch empty HTML:

In `apps/admin/lib/validations/post.ts`, update the content validation:

```ts
content: z
  .string()
  .min(1, 'Sadržaj je obavezan')
  .refine(
    (val) => {
      // Strip HTML tags and check if there's actual content
      const textContent = val.replace(/<[^>]*>/g, '').trim();
      return textContent.length > 0;
    },
    { message: 'Sadržaj je obavezan' }
  ),
```

**Step 2: Add tests for HTML content validation**

Add to `apps/admin/lib/validations/post.test.ts`:

```ts
describe('content with HTML', () => {
  it('accepts valid HTML content', () => {
    const result = postFormSchema.safeParse({
      title: 'Test',
      content: '<p>Valid content</p>',
      category: 'aktualnosti',
      isFeatured: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty paragraph tags', () => {
    const result = postFormSchema.safeParse({
      title: 'Test',
      content: '<p></p>',
      category: 'aktualnosti',
      isFeatured: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only HTML', () => {
    const result = postFormSchema.safeParse({
      title: 'Test',
      content: '<p>   </p>',
      category: 'aktualnosti',
      isFeatured: false,
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 3: Run tests**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin && pnpm test
```

Expected: All tests pass.

**Step 4: Commit**

```bash
git add apps/admin/lib/validations/post.ts apps/admin/lib/validations/post.test.ts
git commit -m "feat(admin): update content validation to handle HTML"
```

---

## Task 6: Manual Testing & Polish

**Step 1: Start dev server**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm dev
```

**Step 2: Manual testing checklist**

Open http://localhost:3001/posts/new and verify:

- [ ] Editor renders with placeholder text
- [ ] Toolbar buttons work (bold, italic, underline)
- [ ] Headings (H2, H3, H4) apply correctly
- [ ] Lists (bullet, numbered) work
- [ ] Blockquote works
- [ ] Link dialog opens, can add/remove links
- [ ] Form submits with content
- [ ] Error state shows red border when empty
- [ ] Edit existing post loads content correctly

**Step 3: Fix any styling issues**

Adjust Tailwind classes in tiptap-editor.tsx if needed.

**Step 4: Run all gates**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check && pnpm test && pnpm build
```

Expected: All pass.

**Step 5: Final commit (if any fixes)**

```bash
git add -A
git commit -m "fix(ui): polish TipTap editor styling"
```

---

## Task 7: Update Documentation

**Files:**
- Modify: `ROADMAP.md`
- Modify: `CHANGELOG.md`

**Step 1: Update ROADMAP.md**

Change Sprint 1.4 status from ⬜ to ✅:

```markdown
| 1.4 ✅ | TipTap editor | 🔗 | 1.3 | Rich text editing in post form |
```

Update Active Sprint to 1.5.

**Step 2: Update CHANGELOG.md**

Add entry:

```markdown
## [Unreleased]

### Added
- TipTap rich text editor component in @repo/ui
- Rich text editing in post form (bold, italic, underline, links, headings, lists, blockquote)
- HTML content validation for posts
```

**Step 3: Commit**

```bash
git add ROADMAP.md CHANGELOG.md
git commit -m "docs: mark Sprint 1.4 TipTap editor complete"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Install TipTap dependencies | packages/ui/package.json |
| 2 | Create TipTapEditor component | packages/ui/src/components/ui/tiptap-editor.tsx |
| 3 | Add Vitest to UI package | packages/ui/vitest.config.ts |
| 4 | Integrate in post form | apps/admin/components/posts/post-form.tsx |
| 5 | Update content validation | apps/admin/lib/validations/post.ts |
| 6 | Manual testing & polish | - |
| 7 | Update documentation | ROADMAP.md, CHANGELOG.md |

**Gate:** Rich text editing in post form - create post with formatted content, edit it, verify formatting persists.

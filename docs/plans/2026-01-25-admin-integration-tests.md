# Sprint 1.12: Admin Integration Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add end-to-end Playwright tests verifying all CRUD operations work through the admin UI.

**Architecture:** Extend existing Playwright setup with test specs for each admin module. Use shared login helper and direct Prisma client for database assertions. Each test follows the pattern: login → create entity → verify in list → edit → verify changes → delete → verify removal.

**Tech Stack:** Playwright 1.58, Prisma (for assertions), TypeScript

---

## Context

**Existing E2E infrastructure:**
- `apps/admin/playwright.config.ts` - Playwright config (single worker, sequential)
- `apps/admin/e2e/helpers/db.ts` - Prisma client for database assertions
- `apps/admin/e2e/helpers/test-user.ts` - Test credentials (admin@velikibukovec.hr)
- `apps/admin/e2e/auth.spec.ts` - Auth flow tests (login, logout, protected routes)
- `apps/admin/e2e/dashboard.spec.ts` - Dashboard accessibility tests
- `apps/admin/e2e/layout.spec.ts` - Layout/navigation tests

**Modules to test (from Phase 1 sprints):**
1. Posts (1.3) - CRUD with TipTap editor
2. Documents (1.6) - PDF upload, categorize, delete
3. Pages (1.7) - Hierarchical pages with TipTap
4. Events (1.8) - Events with date and poster
5. Galleries (1.9) - Albums with image upload
6. Settings (1.10) - Profile update (skip 2FA - requires TOTP app)
7. Users (1.11) - User CRUD with role management

**Run command:** `pnpm --filter @repo/admin test:e2e`

---

## Task 1: Add shared login helper

**Files:**
- Modify: `apps/admin/e2e/helpers/auth.ts` (create)

**Step 1: Create the shared auth helper**

```typescript
// apps/admin/e2e/helpers/auth.ts
import type { Page } from '@playwright/test';

import { TEST_USER } from './test-user';

export async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}
```

**Step 2: Commit**

```bash
git add apps/admin/e2e/helpers/auth.ts
git commit -m "feat(e2e): add shared login helper"
```

---

## Task 2: Add database helpers for CRUD assertions

**Files:**
- Modify: `apps/admin/e2e/helpers/db.ts`

**Step 1: Extend db helpers with entity queries**

Add to existing `db.ts`:

```typescript
// Posts
export async function getPostByTitle(title: string) {
  return prisma.post.findFirst({
    where: { title },
  });
}

export async function deletePostByTitle(title: string) {
  return prisma.post.deleteMany({
    where: { title },
  });
}

// Pages
export async function getPageByTitle(title: string) {
  return prisma.page.findFirst({
    where: { title },
  });
}

export async function deletePageByTitle(title: string) {
  return prisma.page.deleteMany({
    where: { title },
  });
}

// Events
export async function getEventByTitle(title: string) {
  return prisma.event.findFirst({
    where: { title },
  });
}

export async function deleteEventByTitle(title: string) {
  return prisma.event.deleteMany({
    where: { title },
  });
}

// Galleries
export async function getGalleryByTitle(title: string) {
  return prisma.gallery.findFirst({
    where: { title },
  });
}

export async function deleteGalleryByTitle(title: string) {
  return prisma.gallery.deleteMany({
    where: { title },
  });
}

// Documents
export async function getDocumentByTitle(title: string) {
  return prisma.document.findFirst({
    where: { title },
  });
}

export async function deleteDocumentByTitle(title: string) {
  return prisma.document.deleteMany({
    where: { title },
  });
}

// Users
export async function getUserByName(name: string) {
  return prisma.user.findFirst({
    where: { name },
  });
}

export async function deleteUserByEmail(email: string) {
  // Delete associated accounts first
  await prisma.account.deleteMany({
    where: { user: { email } },
  });
  return prisma.user.deleteMany({
    where: { email },
  });
}
```

**Step 2: Commit**

```bash
git add apps/admin/e2e/helpers/db.ts
git commit -m "feat(e2e): add database helpers for CRUD assertions"
```

---

## Task 3: Posts E2E test

**Files:**
- Create: `apps/admin/e2e/posts.spec.ts`

**Step 1: Create posts E2E test**

```typescript
// apps/admin/e2e/posts.spec.ts
import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import {
  deletePostByTitle,
  disconnectDb,
  getPostByTitle,
} from './helpers/db';

const TEST_POST_TITLE = 'E2E Test Post ' + Date.now();

test.describe('Posts CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterAll(async () => {
    // Cleanup any leftover test posts
    await deletePostByTitle(TEST_POST_TITLE);
    await disconnectDb();
  });

  test('create, edit, and delete post', async ({ page }) => {
    // Navigate to posts
    await page.click('a[href="/posts"]');
    await page.waitForURL('/posts');

    // Click new post button
    await page.click('a[href="/posts/new"]');
    await page.waitForURL('/posts/new');

    // Fill form
    await page.fill('input[name="title"]', TEST_POST_TITLE);

    // TipTap editor - click and type
    await page.click('.tiptap');
    await page.keyboard.type('This is test content for E2E testing.');

    // Select category
    await page.click('[data-testid="category-select"]');
    await page.click('[data-value="vijesti"]');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to posts list
    await page.waitForURL('/posts');

    // Verify post exists in database
    const post = await getPostByTitle(TEST_POST_TITLE);
    expect(post).not.toBeNull();
    expect(post?.title).toBe(TEST_POST_TITLE);

    // Verify post appears in list
    await expect(page.locator(`text=${TEST_POST_TITLE}`)).toBeVisible();

    // Click edit
    await page.click(`tr:has-text("${TEST_POST_TITLE}") button[aria-label="Akcije"]`);
    await page.click('text=Uredi');

    // Wait for edit page
    await page.waitForURL(/\/posts\/[^/]+$/);

    // Edit title
    const editedTitle = TEST_POST_TITLE + ' Edited';
    await page.fill('input[name="title"]', editedTitle);
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/posts');

    // Verify edit in database
    const editedPost = await getPostByTitle(editedTitle);
    expect(editedPost).not.toBeNull();

    // Delete post
    await page.click(`tr:has-text("${editedTitle}") button[aria-label="Akcije"]`);
    await page.click('text=Obriši');

    // Confirm delete in dialog
    await page.click('button:has-text("Obriši")');

    // Verify deleted
    await expect(page.locator(`text=${editedTitle}`)).not.toBeVisible();

    // Cleanup the edited title
    await deletePostByTitle(editedTitle);
  });
});
```

**Step 2: Run test to verify**

```bash
cd apps/admin && pnpm exec playwright test posts.spec.ts --headed
```

**Step 3: Commit**

```bash
git add apps/admin/e2e/posts.spec.ts
git commit -m "feat(e2e): add posts CRUD integration test"
```

---

## Task 4: Pages E2E test

**Files:**
- Create: `apps/admin/e2e/pages.spec.ts`

**Step 1: Create pages E2E test**

```typescript
// apps/admin/e2e/pages.spec.ts
import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import {
  deletePageByTitle,
  disconnectDb,
  getPageByTitle,
} from './helpers/db';

const TEST_PAGE_TITLE = 'E2E Test Page ' + Date.now();

test.describe('Pages CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterAll(async () => {
    await deletePageByTitle(TEST_PAGE_TITLE);
    await disconnectDb();
  });

  test('create, edit, and delete page', async ({ page }) => {
    // Navigate to pages
    await page.click('a[href="/pages"]');
    await page.waitForURL('/pages');

    // Click new page button
    await page.click('a[href="/pages/new"]');
    await page.waitForURL('/pages/new');

    // Fill form
    await page.fill('input[name="title"]', TEST_PAGE_TITLE);

    // TipTap editor
    await page.click('.tiptap');
    await page.keyboard.type('Test page content for E2E.');

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForURL('/pages');

    // Verify in database
    const dbPage = await getPageByTitle(TEST_PAGE_TITLE);
    expect(dbPage).not.toBeNull();

    // Verify in list
    await expect(page.locator(`text=${TEST_PAGE_TITLE}`)).toBeVisible();

    // Edit
    await page.click(`tr:has-text("${TEST_PAGE_TITLE}") button[aria-label="Akcije"]`);
    await page.click('text=Uredi');
    await page.waitForURL(/\/pages\/[^/]+$/);

    const editedTitle = TEST_PAGE_TITLE + ' Edited';
    await page.fill('input[name="title"]', editedTitle);
    await page.click('button[type="submit"]');
    await page.waitForURL('/pages');

    // Delete
    await page.click(`tr:has-text("${editedTitle}") button[aria-label="Akcije"]`);
    await page.click('text=Obriši');
    await page.click('button:has-text("Obriši")');

    await expect(page.locator(`text=${editedTitle}`)).not.toBeVisible();

    // Cleanup
    await deletePageByTitle(editedTitle);
  });
});
```

**Step 2: Commit**

```bash
git add apps/admin/e2e/pages.spec.ts
git commit -m "feat(e2e): add pages CRUD integration test"
```

---

## Task 5: Events E2E test

**Files:**
- Create: `apps/admin/e2e/events.spec.ts`

**Step 1: Create events E2E test**

```typescript
// apps/admin/e2e/events.spec.ts
import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import {
  deleteEventByTitle,
  disconnectDb,
  getEventByTitle,
} from './helpers/db';

const TEST_EVENT_TITLE = 'E2E Test Event ' + Date.now();

test.describe('Events CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterAll(async () => {
    await deleteEventByTitle(TEST_EVENT_TITLE);
    await disconnectDb();
  });

  test('create, edit, and delete event', async ({ page }) => {
    // Navigate to events
    await page.click('a[href="/events"]');
    await page.waitForURL('/events');

    // Click new event button
    await page.click('a[href="/events/new"]');
    await page.waitForURL('/events/new');

    // Fill form
    await page.fill('input[name="title"]', TEST_EVENT_TITLE);

    // Set date (use date picker)
    await page.click('button[aria-label="Odaberi datum"]');
    // Click a future date (15th of current month)
    await page.click('.rdp-day:has-text("15")');

    // Location
    await page.fill('input[name="location"]', 'Test Location');

    // TipTap editor for description
    await page.click('.tiptap');
    await page.keyboard.type('Test event description.');

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForURL('/events');

    // Verify in database
    const event = await getEventByTitle(TEST_EVENT_TITLE);
    expect(event).not.toBeNull();

    // Verify in list
    await expect(page.locator(`text=${TEST_EVENT_TITLE}`)).toBeVisible();

    // Edit
    await page.click(`tr:has-text("${TEST_EVENT_TITLE}") button[aria-label="Akcije"]`);
    await page.click('text=Uredi');
    await page.waitForURL(/\/events\/[^/]+$/);

    const editedTitle = TEST_EVENT_TITLE + ' Edited';
    await page.fill('input[name="title"]', editedTitle);
    await page.click('button[type="submit"]');
    await page.waitForURL('/events');

    // Delete
    await page.click(`tr:has-text("${editedTitle}") button[aria-label="Akcije"]`);
    await page.click('text=Obriši');
    await page.click('button:has-text("Obriši")');

    await expect(page.locator(`text=${editedTitle}`)).not.toBeVisible();

    // Cleanup
    await deleteEventByTitle(editedTitle);
  });
});
```

**Step 2: Commit**

```bash
git add apps/admin/e2e/events.spec.ts
git commit -m "feat(e2e): add events CRUD integration test"
```

---

## Task 6: Galleries E2E test

**Files:**
- Create: `apps/admin/e2e/galleries.spec.ts`

**Step 1: Create galleries E2E test**

```typescript
// apps/admin/e2e/galleries.spec.ts
import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import {
  deleteGalleryByTitle,
  disconnectDb,
  getGalleryByTitle,
} from './helpers/db';

const TEST_GALLERY_TITLE = 'E2E Test Gallery ' + Date.now();

test.describe('Galleries CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterAll(async () => {
    await deleteGalleryByTitle(TEST_GALLERY_TITLE);
    await disconnectDb();
  });

  test('create, edit, and delete gallery', async ({ page }) => {
    // Navigate to galleries
    await page.click('a[href="/galleries"]');
    await page.waitForURL('/galleries');

    // Click new gallery button
    await page.click('a[href="/galleries/new"]');
    await page.waitForURL('/galleries/new');

    // Fill form
    await page.fill('input[name="title"]', TEST_GALLERY_TITLE);

    // Set date
    await page.click('button[aria-label="Odaberi datum"]');
    await page.click('.rdp-day:has-text("10")');

    // Description (optional)
    await page.fill('textarea[name="description"]', 'Test gallery description');

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForURL('/galleries');

    // Verify in database
    const gallery = await getGalleryByTitle(TEST_GALLERY_TITLE);
    expect(gallery).not.toBeNull();

    // Verify in list
    await expect(page.locator(`text=${TEST_GALLERY_TITLE}`)).toBeVisible();

    // Edit
    await page.click(`tr:has-text("${TEST_GALLERY_TITLE}") button[aria-label="Akcije"]`);
    await page.click('text=Uredi');
    await page.waitForURL(/\/galleries\/[^/]+$/);

    const editedTitle = TEST_GALLERY_TITLE + ' Edited';
    await page.fill('input[name="title"]', editedTitle);
    await page.click('button[type="submit"]');
    await page.waitForURL('/galleries');

    // Delete
    await page.click(`tr:has-text("${editedTitle}") button[aria-label="Akcije"]`);
    await page.click('text=Obriši');
    await page.click('button:has-text("Obriši")');

    await expect(page.locator(`text=${editedTitle}`)).not.toBeVisible();

    // Cleanup
    await deleteGalleryByTitle(editedTitle);
  });
});
```

**Step 2: Commit**

```bash
git add apps/admin/e2e/galleries.spec.ts
git commit -m "feat(e2e): add galleries CRUD integration test"
```

---

## Task 7: Settings E2E test

**Files:**
- Create: `apps/admin/e2e/settings.spec.ts`

**Step 1: Create settings E2E test**

```typescript
// apps/admin/e2e/settings.spec.ts
import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import { disconnectDb, getUserByEmail } from './helpers/db';
import { TEST_USER } from './helpers/test-user';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterAll(async () => {
    await disconnectDb();
  });

  test('can update profile name', async ({ page }) => {
    // Navigate to settings
    await page.click('a[href="/settings"]');
    await page.waitForURL('/settings');

    // Get current name
    const user = await getUserByEmail(TEST_USER.email);
    const originalName = user?.name ?? 'Admin';

    // Update name
    const newName = 'E2E Test Name ' + Date.now();
    await page.fill('input[name="name"]', newName);
    await page.click('button:has-text("Spremi promjene")');

    // Wait for success toast
    await expect(page.locator('text=Profil uspješno ažuriran')).toBeVisible();

    // Verify in database
    const updatedUser = await getUserByEmail(TEST_USER.email);
    expect(updatedUser?.name).toBe(newName);

    // Restore original name
    await page.fill('input[name="name"]', originalName);
    await page.click('button:has-text("Spremi promjene")');
    await expect(page.locator('text=Profil uspješno ažuriran')).toBeVisible();
  });

  test('sessions list shows current session', async ({ page }) => {
    // Navigate to settings
    await page.click('a[href="/settings"]');
    await page.waitForURL('/settings');

    // Verify current session is shown
    await expect(page.locator('text=Trenutna sesija')).toBeVisible();
  });
});
```

**Step 2: Commit**

```bash
git add apps/admin/e2e/settings.spec.ts
git commit -m "feat(e2e): add settings integration test"
```

---

## Task 8: Users E2E test

**Files:**
- Create: `apps/admin/e2e/users.spec.ts`

**Step 1: Create users E2E test**

```typescript
// apps/admin/e2e/users.spec.ts
import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import {
  deleteUserByEmail,
  disconnectDb,
  getUserByName,
} from './helpers/db';

const TEST_USER_NAME = 'E2E Test User ' + Date.now();
const TEST_USER_EMAIL = `e2e-test-${Date.now()}@example.com`;

test.describe('Users CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterAll(async () => {
    await deleteUserByEmail(TEST_USER_EMAIL);
    await disconnectDb();
  });

  test('create, edit, and deactivate user', async ({ page }) => {
    // Navigate to users
    await page.click('a[href="/users"]');
    await page.waitForURL('/users');

    // Click new user button
    await page.click('a[href="/users/new"]');
    await page.waitForURL('/users/new');

    // Fill form
    await page.fill('input[name="name"]', TEST_USER_NAME);
    await page.fill('input[name="email"]', TEST_USER_EMAIL);
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Select role
    await page.click('[id="role"]');
    await page.click('[data-value="staff"]');

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForURL('/users');

    // Verify in database
    const user = await getUserByName(TEST_USER_NAME);
    expect(user).not.toBeNull();
    expect(user?.email).toBe(TEST_USER_EMAIL);

    // Verify in list
    await expect(page.locator(`text=${TEST_USER_NAME}`)).toBeVisible();

    // Edit user
    await page.click(`tr:has-text("${TEST_USER_NAME}") button[aria-label="Akcije"]`);
    await page.click('text=Uredi');
    await page.waitForURL(/\/users\/[^/]+$/);

    const editedName = TEST_USER_NAME + ' Edited';
    await page.fill('input[name="name"]', editedName);
    await page.click('button[type="submit"]');
    await page.waitForURL('/users');

    // Verify edit
    await expect(page.locator(`text=${editedName}`)).toBeVisible();

    // Deactivate user
    await page.click(`tr:has-text("${editedName}") button[aria-label="Akcije"]`);
    await page.click('text=Deaktiviraj');

    // Verify deactivated status
    await expect(page.locator(`tr:has-text("${editedName}") :text("Neaktivan")`)).toBeVisible();

    // Cleanup
    await deleteUserByEmail(TEST_USER_EMAIL);
  });
});
```

**Step 2: Commit**

```bash
git add apps/admin/e2e/users.spec.ts
git commit -m "feat(e2e): add users CRUD integration test"
```

---

## Task 9: Update CHANGELOG and ROADMAP

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

**Step 1: Update CHANGELOG**

Add under `## Unreleased`:

```markdown
## Sprint 1.12 - Admin Integration Tests (Completed)

### Added
- Shared login helper for E2E tests
- Database helpers for entity CRUD assertions
- Posts E2E test (create, edit, delete flow)
- Pages E2E test (create, edit, delete flow)
- Events E2E test (create, edit, delete flow)
- Galleries E2E test (create, edit, delete flow)
- Settings E2E test (profile update, sessions list)
- Users E2E test (create, edit, deactivate flow)
- Gate: All CRUD operations work end-to-end
```

**Step 2: Update ROADMAP**

Change Sprint 1.12 status from `⬜` to `✅` and update progress to 12/12.

**Step 3: Commit**

```bash
git add CHANGELOG.md ROADMAP.md
git commit -m "docs: update CHANGELOG and ROADMAP for Sprint 1.12"
```

---

## Task 10: Final verification

**Step 1: Run all E2E tests**

```bash
cd apps/admin && pnpm exec playwright test
```

Expected: All tests pass.

**Step 2: Run lint and type-check**

```bash
pnpm lint && pnpm type-check
```

Expected: No errors from E2E files.

**Step 3: Commit any fixes if needed**

---

## Summary

This plan adds 6 new E2E test files covering:
- Posts CRUD (TipTap editor integration)
- Pages CRUD (hierarchical pages)
- Events CRUD (date picker)
- Galleries CRUD (album management)
- Settings (profile updates)
- Users CRUD (role management, deactivation)

Total new E2E tests: ~8 test cases across 6 files.

Gate verification: "All CRUD operations work end-to-end" - each module has at least one complete create-edit-delete cycle test.

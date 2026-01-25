import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import { deletePageByTitle, disconnectDb, getPageByTitle } from './helpers/db';

test.describe('Pages CRUD', () => {
  const TEST_PAGE_TITLE = `E2E Test Page ${Date.now()}`;
  const UPDATED_PAGE_TITLE = `${TEST_PAGE_TITLE} - Updated`;

  test.afterAll(async () => {
    // Clean up any leftover test pages
    await deletePageByTitle(TEST_PAGE_TITLE);
    await deletePageByTitle(UPDATED_PAGE_TITLE);
    await disconnectDb();
  });

  test('full CRUD lifecycle: create, verify, edit, delete', async ({
    page,
  }) => {
    // Step 1: Login
    await login(page);

    // Step 2: Navigate to pages and create a new page
    await page.goto('/pages');
    await page.getByRole('link', { name: 'Nova stranica' }).click();
    await page.waitForURL('/pages/new');

    // Fill in the page form
    await page.fill('#title', TEST_PAGE_TITLE);

    // Fill TipTap editor - click into it and type
    await page.click('.tiptap');
    await page.keyboard.type('This is a test page content for E2E testing.');

    // Save the page
    await page.getByRole('button', { name: 'Spremi' }).click();

    // Wait for redirect to pages list
    await page.waitForURL('/pages');

    // Step 3: Verify page appears in the list
    await expect(page.getByRole('link', { name: TEST_PAGE_TITLE })).toBeVisible();

    // Verify page exists in database
    const createdPage = await getPageByTitle(TEST_PAGE_TITLE);
    expect(createdPage).not.toBeNull();
    expect(createdPage?.title).toBe(TEST_PAGE_TITLE);

    // Step 4: Edit the page
    // Find the row with our page and open the actions menu
    const pageRow = page.locator('tr').filter({ hasText: TEST_PAGE_TITLE });
    await pageRow.getByRole('button', { name: 'Otvori izbornik' }).click();

    // Click Edit from dropdown
    await page.getByRole('menuitem', { name: 'Uredi' }).click();
    await page.waitForURL(/\/pages\/.*\/edit/);

    // Update the title
    await page.fill('#title', UPDATED_PAGE_TITLE);

    // Save the changes
    await page.getByRole('button', { name: 'Spremi' }).click();

    // Wait for redirect back to pages list
    await page.waitForURL('/pages');

    // Verify updated page appears in the list
    await expect(
      page.getByRole('link', { name: UPDATED_PAGE_TITLE })
    ).toBeVisible();

    // Verify old title no longer appears
    await expect(
      page.getByRole('link', { name: TEST_PAGE_TITLE })
    ).not.toBeVisible();

    // Verify update in database
    const updatedPage = await getPageByTitle(UPDATED_PAGE_TITLE);
    expect(updatedPage).not.toBeNull();
    expect(updatedPage?.title).toBe(UPDATED_PAGE_TITLE);

    // Step 5: Delete the page
    const updatedPageRow = page.locator('tr').filter({
      hasText: UPDATED_PAGE_TITLE,
    });
    await updatedPageRow.getByRole('button', { name: 'Otvori izbornik' }).click();

    // Click Delete from dropdown
    await page.getByRole('menuitem', { name: /Obri[šs]i/ }).click();

    // Confirm deletion in dialog
    await page.getByRole('button', { name: /Obri[šs]i/ }).click();

    // Wait for the page to be removed from the list
    await expect(
      page.getByRole('link', { name: UPDATED_PAGE_TITLE })
    ).not.toBeVisible();

    // Verify page is deleted from database
    const deletedPage = await getPageByTitle(UPDATED_PAGE_TITLE);
    expect(deletedPage).toBeNull();
  });
});

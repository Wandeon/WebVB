import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import { deletePostByTitle, disconnectDb, getPostByTitle } from './helpers/db';

test.describe('Posts CRUD', () => {
  const TEST_POST_TITLE = `E2E Test Post ${Date.now()}`;
  const UPDATED_POST_TITLE = `${TEST_POST_TITLE} - Updated`;

  test.afterAll(async () => {
    // Clean up any leftover test posts
    await deletePostByTitle(TEST_POST_TITLE);
    await deletePostByTitle(UPDATED_POST_TITLE);
    await disconnectDb();
  });

  test('full CRUD lifecycle: create, verify, edit, delete', async ({
    page,
  }) => {
    // Step 1: Login
    await login(page);

    // Step 2: Navigate to posts and create a new post
    await page.goto('/posts');
    await page.getByRole('link', { name: 'Nova objava' }).click();
    await page.waitForURL('/posts/new');

    // Fill in the post form
    await page.fill('#title', TEST_POST_TITLE);

    // Select category - click the trigger then select an option
    await page.click('#category');
    await page.getByRole('option', { name: 'Opcinske aktualnosti' }).click();

    // Fill TipTap editor - click into it and type
    await page.click('.tiptap');
    await page.keyboard.type('This is a test post content for E2E testing.');

    // Publish the post
    await page.getByRole('button', { name: 'Objavi' }).click();

    // Wait for redirect to posts list
    await page.waitForURL('/posts');

    // Step 3: Verify post appears in the list
    await expect(page.getByRole('link', { name: TEST_POST_TITLE })).toBeVisible();

    // Verify post exists in database
    const createdPost = await getPostByTitle(TEST_POST_TITLE);
    expect(createdPost).not.toBeNull();
    expect(createdPost?.title).toBe(TEST_POST_TITLE);
    expect(createdPost?.publishedAt).not.toBeNull();

    // Step 4: Edit the post
    // Find the row with our post and open the actions menu
    const postRow = page.locator('tr').filter({ hasText: TEST_POST_TITLE });
    await postRow.getByRole('button', { name: 'Otvori izbornik' }).click();

    // Click Edit from dropdown
    await page.getByRole('menuitem', { name: 'Uredi' }).click();
    await page.waitForURL(/\/posts\/.*\/edit/);

    // Update the title
    await page.fill('#title', UPDATED_POST_TITLE);

    // Save the changes
    await page.getByRole('button', { name: 'Objavi' }).click();

    // Wait for redirect back to posts list
    await page.waitForURL('/posts');

    // Verify updated post appears in the list
    await expect(
      page.getByRole('link', { name: UPDATED_POST_TITLE })
    ).toBeVisible();

    // Verify old title no longer appears
    await expect(
      page.getByRole('link', { name: TEST_POST_TITLE })
    ).not.toBeVisible();

    // Verify update in database
    const updatedPost = await getPostByTitle(UPDATED_POST_TITLE);
    expect(updatedPost).not.toBeNull();
    expect(updatedPost?.title).toBe(UPDATED_POST_TITLE);

    // Step 5: Delete the post
    const updatedPostRow = page.locator('tr').filter({
      hasText: UPDATED_POST_TITLE,
    });
    await updatedPostRow.getByRole('button', { name: 'Otvori izbornik' }).click();

    // Click Delete from dropdown
    await page.getByRole('menuitem', { name: /Obri[šs]i/ }).click();

    // Confirm deletion in dialog
    await page.getByRole('button', { name: /Obri[šs]i/ }).click();

    // Wait for the post to be removed from the list
    await expect(
      page.getByRole('link', { name: UPDATED_POST_TITLE })
    ).not.toBeVisible();

    // Verify post is deleted from database
    const deletedPost = await getPostByTitle(UPDATED_POST_TITLE);
    expect(deletedPost).toBeNull();
  });
});

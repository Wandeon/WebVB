import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import { deleteGalleryByName, disconnectDb, getGalleryByName } from './helpers/db';

test.describe('Galleries CRUD', () => {
  const TEST_GALLERY_NAME = `E2E Test Gallery ${Date.now()}`;
  const UPDATED_GALLERY_NAME = `${TEST_GALLERY_NAME} - Updated`;

  test.afterAll(async () => {
    // Clean up any leftover test galleries
    await deleteGalleryByName(TEST_GALLERY_NAME);
    await deleteGalleryByName(UPDATED_GALLERY_NAME);
    await disconnectDb();
  });

  test('full CRUD lifecycle: create, verify, edit, delete', async ({
    page,
  }) => {
    // Step 1: Login
    await login(page);

    // Step 2: Navigate to galleries and create a new gallery
    await page.goto('/galleries');
    await page.click('a:has-text("Nova galerija")');
    await page.waitForURL('/galleries/new');

    // Fill in the gallery form
    await page.fill('#name', TEST_GALLERY_NAME);

    // Fill optional description
    await page.fill('#description', 'This is a test gallery for E2E testing.');

    // Set optional event date (using today's date)
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#eventDate', today ?? '');

    // Save the gallery
    await page.click('button:has-text("Spremi")');

    // Wait for redirect to galleries list
    await page.waitForURL('/galleries');

    // Step 3: Verify gallery appears in the list
    await expect(page.getByRole('link', { name: TEST_GALLERY_NAME })).toBeVisible();

    // Verify gallery exists in database
    const createdGallery = await getGalleryByName(TEST_GALLERY_NAME);
    expect(createdGallery).not.toBeNull();
    expect(createdGallery?.name).toBe(TEST_GALLERY_NAME);

    // Step 4: Edit the gallery
    // Find the row with our gallery and open the actions menu
    const galleryRow = page.locator('tr').filter({ hasText: TEST_GALLERY_NAME });
    await galleryRow.locator('button[aria-label="Otvori izbornik"]').click();

    // Click Edit from dropdown
    await page.click('[role="menuitem"]:has-text("Uredi")');
    await page.waitForURL(/\/galleries\/.*/);

    // Update the name
    await page.fill('#name', UPDATED_GALLERY_NAME);

    // Save the changes
    await page.click('button:has-text("Spremi")');

    // Wait for redirect back to galleries list
    await page.waitForURL('/galleries');

    // Verify updated gallery appears in the list
    await expect(
      page.getByRole('link', { name: UPDATED_GALLERY_NAME })
    ).toBeVisible();

    // Verify old name no longer appears
    await expect(
      page.getByRole('link', { name: TEST_GALLERY_NAME })
    ).not.toBeVisible();

    // Verify update in database
    const updatedGallery = await getGalleryByName(UPDATED_GALLERY_NAME);
    expect(updatedGallery).not.toBeNull();
    expect(updatedGallery?.name).toBe(UPDATED_GALLERY_NAME);

    // Step 5: Delete the gallery
    const updatedGalleryRow = page.locator('tr').filter({
      hasText: UPDATED_GALLERY_NAME,
    });
    await updatedGalleryRow.locator('button[aria-label="Otvori izbornik"]').click();

    // Click Delete from dropdown
    await page.click('[role="menuitem"]:has-text("Obrisi")');

    // Confirm deletion in dialog
    await page.click('button:has-text("Obrisi")');

    // Wait for the gallery to be removed from the list
    await expect(
      page.getByRole('link', { name: UPDATED_GALLERY_NAME })
    ).not.toBeVisible();

    // Verify gallery is deleted from database
    const deletedGallery = await getGalleryByName(UPDATED_GALLERY_NAME);
    expect(deletedGallery).toBeNull();
  });
});

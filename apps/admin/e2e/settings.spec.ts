import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import { disconnectDb, getUserByEmail } from './helpers/db';
import { TEST_USER } from './helpers/test-user';

test.describe('Settings', () => {
  test.afterAll(async () => {
    await disconnectDb();
  });

  test('profile name update: change name, verify in database, restore original', async ({
    page,
  }) => {
    // Step 1: Login and navigate to settings
    await login(page);
    await page.goto('/settings');

    // Step 2: Get original name from database
    const originalUser = await getUserByEmail(TEST_USER.email);
    expect(originalUser).not.toBeNull();
    const originalName = originalUser!.name;

    // Step 3: Update the profile name
    const newName = `Test User ${Date.now()}`;
    await page.fill('#name', newName);

    // Click save button
    await page.click('button:has-text("Spremi promjene")');

    // Wait for success toast
    await expect(page.getByText('Profil je uspješno ažuriran.')).toBeVisible();

    // Step 4: Verify name change in database
    const updatedUser = await getUserByEmail(TEST_USER.email);
    expect(updatedUser).not.toBeNull();
    expect(updatedUser!.name).toBe(newName);

    // Step 5: Restore original name
    await page.fill('#name', originalName ?? '');
    await page.click('button:has-text("Spremi promjene")');

    // Wait for success toast again
    await expect(page.getByText('Profil je uspješno ažuriran.')).toBeVisible();

    // Verify restoration in database
    const restoredUser = await getUserByEmail(TEST_USER.email);
    expect(restoredUser).not.toBeNull();
    expect(restoredUser!.name).toBe(originalName);
  });

  test('sessions list shows current session', async ({ page }) => {
    // Step 1: Login and navigate to settings
    await login(page);
    await page.goto('/settings');

    // Step 2: Verify sessions section is visible
    await expect(page.getByText('Aktivne sesije')).toBeVisible();

    // Step 3: Verify current session badge is shown
    await expect(page.getByText('Trenutna sesija')).toBeVisible();
  });
});

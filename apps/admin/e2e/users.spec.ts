import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import { deleteUserByEmail, disconnectDb, getUserByName } from './helpers/db';

test.describe('Users CRUD', () => {
  const timestamp = Date.now();
  const TEST_USER_NAME = `E2E Test User ${timestamp}`;
  const TEST_USER_EMAIL = `e2e-test-user-${timestamp}@example.com`;
  const UPDATED_USER_NAME = `${TEST_USER_NAME} - Updated`;

  test.afterAll(async () => {
    // Clean up any leftover test users
    await deleteUserByEmail(TEST_USER_EMAIL);
    await disconnectDb();
  });

  test('full CRUD lifecycle: create, verify, edit, deactivate', async ({
    page,
  }) => {
    // Step 1: Login
    await login(page);

    // Step 2: Navigate to users and create a new user
    await page.goto('/users');
    await page.getByRole('link', { name: 'Novi korisnik' }).click();
    await page.waitForURL('/users/new');

    // Fill in the user form
    await page.fill('#name', TEST_USER_NAME);
    await page.fill('#email', TEST_USER_EMAIL);
    await page.fill('#password', 'TestPassword123!');

    // Select role - click the trigger then select an option
    await page.click('#role');
    await page.getByRole('option', { name: 'Osoblje' }).click();

    // Create the user
    await page.getByRole('button', { name: 'Stvori korisnika' }).click();

    // Wait for redirect to users list
    await page.waitForURL('/users');

    // Step 3: Verify user appears in the list
    await expect(page.locator('td').filter({ hasText: TEST_USER_NAME })).toBeVisible();

    // Verify user exists in database
    const createdUser = await getUserByName(TEST_USER_NAME);
    expect(createdUser).not.toBeNull();
    expect(createdUser?.name).toBe(TEST_USER_NAME);
    expect(createdUser?.email).toBe(TEST_USER_EMAIL);

    // Step 4: Edit the user
    // Find the row with our user and open the actions menu
    const userRow = page.locator('tr').filter({ hasText: TEST_USER_NAME });
    await userRow.getByRole('button', { name: 'Otvori izbornik' }).click();

    // Click Edit from dropdown
    await page.getByRole('menuitem', { name: 'Uredi' }).click();
    await page.waitForURL(/\/users\/.*$/);

    // Update the name
    await page.fill('#name', UPDATED_USER_NAME);

    // Save the changes
    await page.getByRole('button', { name: 'Spremi promjene' }).click();

    // Wait for redirect back to users list
    await page.waitForURL('/users');

    // Verify updated user appears in the list
    await expect(
      page.locator('td').filter({ hasText: UPDATED_USER_NAME })
    ).toBeVisible();

    // Verify old name no longer appears
    await expect(
      page.locator('td').filter({ hasText: TEST_USER_NAME }).first()
    ).not.toBeVisible();

    // Verify update in database
    const updatedUser = await getUserByName(UPDATED_USER_NAME);
    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.name).toBe(UPDATED_USER_NAME);

    // Step 5: Deactivate the user
    const updatedUserRow = page.locator('tr').filter({
      hasText: UPDATED_USER_NAME,
    });
    await updatedUserRow.getByRole('button', { name: 'Otvori izbornik' }).click();

    // Click Deactivate from dropdown
    await page.getByRole('menuitem', { name: 'Deaktiviraj' }).click();

    // Wait for the inactive badge to appear
    await expect(
      updatedUserRow.locator('text=Neaktivan')
    ).toBeVisible();

    // Verify user is deactivated in database
    const deactivatedUser = await getUserByName(UPDATED_USER_NAME);
    expect(deactivatedUser).not.toBeNull();
    expect(deactivatedUser?.active).toBe(false);

    // Step 6: Delete the user from database and verify removal
    await deleteUserByEmail(TEST_USER_EMAIL);

    await page.reload();

    await expect(
      page.locator('tr').filter({ hasText: UPDATED_USER_NAME })
    ).toHaveCount(0);

    const deletedUser = await getUserByName(UPDATED_USER_NAME);
    expect(deletedUser).toBeNull();
  });
});

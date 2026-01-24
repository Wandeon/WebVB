import { expect, test } from '@playwright/test';

import {
  clearUserSessions,
  disconnectDb,
  getSessionByUserId,
  getUserByEmail,
} from './helpers/db';
import { TEST_USER } from './helpers/test-user';

test.describe('Authentication Flow', () => {
  let testUserId: string;

  test.beforeAll(async () => {
    // Get test user ID for session assertions
    const user = await getUserByEmail(TEST_USER.email);
    if (!user) {
      throw new Error(
        `Test user ${TEST_USER.email} not found. Run: pnpm db:seed`
      );
    }
    testUserId = user.id;
  });

  test.beforeEach(async () => {
    // Clear sessions before each test for clean state
    await clearUserSessions(testUserId);
  });

  test.afterAll(async () => {
    await disconnectDb();
  });

  test('login creates session in database', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/');

    // Verify session was created in database
    const session = await getSessionByUserId(testUserId);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe(testUserId);
    expect(new Date(session!.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  test('protected route redirects to login when not authenticated', async ({
    page,
  }) => {
    // Try to access dashboard directly without login
    await page.goto('/');

    // Should redirect to login page
    await page.waitForURL('/login');

    // Verify we're on login page
    expect(page.url()).toContain('/login');

    // Login form should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

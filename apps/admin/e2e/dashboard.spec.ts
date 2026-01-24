import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { TEST_USER } from './helpers/test-user';

const login = async (page: Page) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
};

test.describe('Dashboard accessibility', () => {
  test('charts expose accessible labels', async ({ page }) => {
    await login(page);

    await expect(
      page.getByRole('img', { name: 'Posjetitelji u zadnjih 7 dana' })
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Sadržaj po kategoriji' })
    ).toBeVisible();
  });
});

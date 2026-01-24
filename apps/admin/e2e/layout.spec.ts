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

test.describe('Admin layout navigation', () => {
  test('marks the active navigation item with aria-current', async ({ page }) => {
    await login(page);

    const nav = page.locator('nav[aria-label="Glavna navigacija"]');
    await expect(nav).toBeVisible();

    const dashboardLink = nav.locator('a[aria-current="page"]');
    await expect(dashboardLink).toContainText('Nadzorna ploča');

    await nav.getByRole('link', { name: 'Objave' }).click();
    await page.waitForURL('/posts');

    const postsLink = nav.locator('a[aria-current="page"]');
    await expect(postsLink).toContainText('Objave');
  });
});

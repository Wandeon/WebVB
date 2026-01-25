import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';

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

import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';

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

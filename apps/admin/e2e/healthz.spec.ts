import { expect, test } from '@playwright/test';

test('healthz returns status without metadata', async ({ request }) => {
  const response = await request.get('/healthz');

  expect(response.ok()).toBe(true);

  const payload = await response.json();

  expect(payload.ok).toBe(true);
  expect(payload.status).toBe('healthy');
  expect(Number.isNaN(Date.parse(payload.timestamp))).toBe(false);
});

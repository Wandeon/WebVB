import { expect, test } from '@playwright/test';

test('healthz returns service metadata', async ({ request }) => {
  const response = await request.get('/healthz');

  expect(response.ok()).toBe(true);

  const payload = await response.json();

  expect(payload.ok).toBe(true);
  expect(payload.service).toBe('@repo/admin');
  expect(typeof payload.version).toBe('string');
  expect(payload.version.length).toBeGreaterThan(0);
  expect(typeof payload.commit).toBe('string');
  expect(payload.commit.length).toBeGreaterThan(0);
  expect(Number.isNaN(Date.parse(payload.timestamp))).toBe(false);
});

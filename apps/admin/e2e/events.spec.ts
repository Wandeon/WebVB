import { expect, test } from '@playwright/test';

import { login } from './helpers/auth';
import { deleteEventByTitle, disconnectDb, getEventByTitle } from './helpers/db';

test.describe('Events CRUD', () => {
  const TEST_EVENT_TITLE = `E2E Test Event ${Date.now()}`;
  const UPDATED_EVENT_TITLE = `${TEST_EVENT_TITLE} - Updated`;

  test.afterAll(async () => {
    // Clean up any leftover test events
    await deleteEventByTitle(TEST_EVENT_TITLE);
    await deleteEventByTitle(UPDATED_EVENT_TITLE);
    await disconnectDb();
  });

  test('full CRUD lifecycle: create, verify, edit, delete', async ({
    page,
  }) => {
    // Step 1: Login
    await login(page);

    // Step 2: Navigate to events and create a new event
    await page.goto('/events');
    await page.getByRole('link', { name: 'Novo događanje' }).click();
    await page.waitForURL('/events/new');

    // Fill in the event form
    await page.fill('#title', TEST_EVENT_TITLE);

    // Set event date (required field) - use tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('#eventDate', dateString!);

    // Set location
    await page.fill('#location', 'Test Location');

    // Fill TipTap editor - click into it and type
    await page.click('.tiptap');
    await page.keyboard.type('This is a test event description for E2E testing.');

    // Save the event
    await page.getByRole('button', { name: 'Spremi' }).click();

    // Wait for redirect to events list
    await page.waitForURL('/events');

    // Step 3: Verify event appears in the list
    await expect(page.getByRole('link', { name: TEST_EVENT_TITLE })).toBeVisible();

    // Verify event exists in database
    const createdEvent = await getEventByTitle(TEST_EVENT_TITLE);
    expect(createdEvent).not.toBeNull();
    expect(createdEvent?.title).toBe(TEST_EVENT_TITLE);

    // Step 4: Edit the event
    // Find the row with our event and open the actions menu
    const eventRow = page.locator('tr').filter({ hasText: TEST_EVENT_TITLE });
    await eventRow.getByRole('button', { name: 'Otvori izbornik' }).click();

    // Click Edit from dropdown
    await page.getByRole('menuitem', { name: 'Uredi' }).click();
    await page.waitForURL(/\/events\/.*\/edit/);

    // Update the title
    await page.fill('#title', UPDATED_EVENT_TITLE);

    // Save the changes
    await page.getByRole('button', { name: 'Spremi' }).click();

    // Wait for redirect back to events list
    await page.waitForURL('/events');

    // Verify updated event appears in the list
    await expect(
      page.getByRole('link', { name: UPDATED_EVENT_TITLE })
    ).toBeVisible();

    // Verify old title no longer appears
    await expect(
      page.getByRole('link', { name: TEST_EVENT_TITLE })
    ).not.toBeVisible();

    // Verify update in database
    const updatedEvent = await getEventByTitle(UPDATED_EVENT_TITLE);
    expect(updatedEvent).not.toBeNull();
    expect(updatedEvent?.title).toBe(UPDATED_EVENT_TITLE);

    // Step 5: Delete the event
    const updatedEventRow = page.locator('tr').filter({
      hasText: UPDATED_EVENT_TITLE,
    });
    await updatedEventRow.getByRole('button', { name: 'Otvori izbornik' }).click();

    // Click Delete from dropdown
    await page.getByRole('menuitem', { name: /Obri[šs]i/ }).click();

    // Confirm deletion in dialog
    await page.getByRole('button', { name: /Obri[šs]i/ }).click();

    // Wait for the event to be removed from the list
    await expect(
      page.getByRole('link', { name: UPDATED_EVENT_TITLE })
    ).not.toBeVisible();

    // Verify event is deleted from database
    const deletedEvent = await getEventByTitle(UPDATED_EVENT_TITLE);
    expect(deletedEvent).toBeNull();
  });
});

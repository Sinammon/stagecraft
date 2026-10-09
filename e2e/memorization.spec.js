import { test, expect } from '@playwright/test';
import { mockAIPractice } from './fixtures.js';

const script =
  'A small daily habit helps us learn. Practice one useful action each day. Choose a habit and begin today.';
async function setup(page) {
  await mockAIPractice(page);
  await page.goto('/#studio');
  await page.getByRole('radio', { name: /Memorization test/ }).check();
  await page.getByLabel('Memorization time (minutes)').fill('1');
  await page.getByLabel('Your practice script').fill(script);
  await page.getByRole('button', { name: 'Set up my recording' }).click();
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Enable camera & microphone' }).click();
  await expect(page.getByRole('button', { name: 'Begin memorization' })).toBeEnabled();
}
test('home and studio are separate views with a retained draft', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#studio')).toBeHidden();
  await page.getByRole('button', { name: 'Enter studio' }).click();
  await expect(page.locator('#home')).toBeHidden();
  await page.getByLabel('Your practice script').fill(script);
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.locator('#studio')).toBeHidden();
  await page.goBack();
  await expect(page.getByLabel('Your practice script')).toHaveValue(script);
});
test('countdown automatically starts a test with only key points and sends the reference for review', async ({
  page,
}) => {
  await setup(page);
  let analysis;
  await page.route('**/api/sessions/*/analyze', (route) => {
    analysis = route.request().postDataBuffer().toString();
    return route.fulfill({ status: 503, json: { error: 'Fixture: AI review unavailable.' } });
  });
  await page.getByRole('button', { name: 'Begin memorization' }).click();
  await expect(page.locator('#memory-timer')).toHaveText(/00:5\d|01:00/);
  await expect(page.locator('.memorization-script')).toHaveText(script);
  // Advance wall time, leaving actual media timestamps and audio capture untouched.
  await page.clock.setFixedTime(new Date(Date.now() + 65000));
  await expect(page.getByRole('button', { name: 'Finish practice' })).toBeVisible();
  await expect(page.locator('.flashcard')).toHaveCount(3);
  await expect(page.locator('#recording-script')).toHaveCount(0);
  await expect(page.getByText(script, { exact: true })).toHaveCount(0);
  await expect(page.locator('#timer')).not.toHaveText('00:00');
  await page.getByRole('button', { name: 'Finish practice' }).click();
  await expect(page.locator('audio')).toBeVisible();
  expect(analysis).toContain('"memorization":{"script":');
  expect(analysis).toContain(script);
});
test('cancel and unavailable key points preserve the script without starting recording', async ({
  page,
}) => {
  await setup(page);
  let sessions = 0;
  page.on('request', (req) => {
    if (req.url().endsWith('/api/sessions')) sessions++;
  });
  await page.route('**/api/flashcards', (route) =>
    route.fulfill({ status: 503, json: { error: 'Talking points unavailable.' } }),
  );
  await page.getByRole('button', { name: 'Begin memorization' }).click();
  await expect(page.getByRole('alert')).toContainText('Talking points unavailable');
  expect(sessions).toBe(0);
  await page.unroute('**/api/flashcards');
  await mockAIPractice(page);
  await page.getByRole('button', { name: 'Begin memorization' }).click();
  await expect(page.locator('.memorization-script')).toHaveText(script);
  await page.getByRole('button', { name: 'Cancel memorization' }).click();
  await expect(page.getByRole('button', { name: 'Begin memorization' })).toBeVisible();
  expect(sessions).toBe(0);
  await page.getByRole('button', { name: 'Back to script' }).click();
  await expect(page.getByLabel('Your practice script')).toHaveValue(script);
});

test('leaving while an early test starts cancels the pending session', async ({ page }) => {
  await setup(page);
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  let requested = false;
  let deleted = false;
  await page.route('**/api/sessions', async (route) => {
    requested = true;
    await pending;
    await route.fulfill({ json: { id: 'browser-fixture' } });
  });
  page.on('request', (request) => {
    if (request.method() === 'DELETE' && request.url().endsWith('/browser-fixture')) deleted = true;
  });
  await page.getByRole('button', { name: 'Begin memorization' }).click();
  await page.getByRole('button', { name: /I’m ready/ }).click();
  await expect.poll(() => requested).toBe(true);
  await expect(page.locator('.memorization-script')).not.toContainText(script);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Home', exact: true })
    .click();
  release();
  await expect.poll(() => deleted).toBe(true);
  await page.locator('.site-header').getByRole('link', { name: 'Open studio' }).click();
  await expect(page.getByRole('button', { name: 'Begin memorization' })).toBeVisible();
  await expect(page.locator('#stop-recording')).toHaveCount(0);
});

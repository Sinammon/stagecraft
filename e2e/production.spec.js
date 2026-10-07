import { expect, test } from '@playwright/test';

test('project-pitch launcher survives health updates and keeps an existing draft', async ({
  page,
}) => {
  let releaseHealth;
  const ready = new Promise((resolve) => {
    releaseHealth = resolve;
  });
  await page.route('**/api/health', async (route) => {
    await ready;
    await route.fulfill({ json: { ok: true, aiConfigured: true } });
  });
  await page.goto('/');
  await page.getByLabel('What are you practicing for?').fill('Our accessible campus project');
  const healthResponse = page.waitForResponse('**/api/health');
  releaseHealth();
  await healthResponse;
  await expect(page.getByLabel('What are you practicing for?')).toHaveValue(
    'Our accessible campus project',
  );
  await page.getByRole('button', { name: 'Project pitch', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Project pitch', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Enter studio' }).click();
  await expect(page.getByLabel('What would you like to talk about?')).toHaveValue(
    'Pitch our group project to my class',
  );
  await page
    .getByLabel('Your practice script')
    .fill('Our project makes campus easier to navigate.');
  await page.getByLabel('My practice focus').fill('Explain the problem before the solution.');
  await page
    .getByRole('navigation', { name: 'Website navigation' })
    .getByRole('link', { name: 'Home', exact: true })
    .click();
  await page.getByRole('button', { name: 'An introduction', exact: true }).click();
  await page.getByRole('button', { name: 'Enter studio' }).click();
  await expect(page.getByLabel('Your practice script')).toHaveValue(
    'Our project makes campus easier to navigate.',
  );
  await expect(page.getByLabel('My practice focus')).toHaveValue(
    'Explain the problem before the solution.',
  );
});

test('homepage topic carries into a usable draft and persists across refresh', async ({ page }) => {
  await page.route('**/api/health', (route) =>
    route.fulfill({ json: { ok: true, aiConfigured: true } }),
  );
  let releaseDraft;
  const ready = new Promise((resolve) => {
    releaseDraft = resolve;
  });
  await page.route('**/api/scripts', async (route) => {
    expect(route.request().postDataJSON().topic).toBe('Introduce an idea to my class');
    await ready;
    await route.fulfill({
      json: { script: 'One small habit can help us learn. Let me show you how it works.' },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Class presentation', exact: true }).click();
  await page.getByRole('button', { name: 'Enter studio' }).click();
  await expect(page.getByLabel('What would you like to talk about?')).toHaveValue(
    'Introduce an idea to my class',
  );
  await page.getByRole('button', { name: 'Generate a draft' }).click();
  await expect(page.getByRole('button', { name: 'Drafting your script' })).toBeDisabled();
  await expect(page.getByLabel('Your practice script')).toHaveAttribute('readonly', '');
  releaseDraft();
  await expect(page.getByLabel('Your practice script')).toHaveValue(/One small habit/);
  await expect(page.getByRole('status')).toContainText([
    'Your draft is ready',
    'Draft kept in this tab',
  ]);
  await page
    .getByLabel('Your practice script')
    .fill('This is my own version of the idea. I want to keep it.');
  await page.reload();
  await expect(page.getByLabel('Your practice script')).toHaveValue(
    'This is my own version of the idea. I want to keep it.',
  );
});

test('malformed draft responses preserve the existing script and offer recovery', async ({
  page,
}) => {
  await page.route('**/api/health', (route) =>
    route.fulfill({ json: { ok: true, aiConfigured: true } }),
  );
  await page.route('**/api/scripts', (route) => route.fulfill({ json: { script: null } }));
  await page.goto('/#studio');
  await page.getByLabel('Your practice script').fill('This is the draft I want to preserve.');
  await page.getByRole('tab', { name: 'Draft with Gemini' }).click();
  await page.getByLabel('What would you like to talk about?').fill('Trying a new habit');
  await page.getByRole('button', { name: 'Generate a draft' }).click();
  await expect(page.getByRole('alert')).toContainText('incomplete');
  await expect(page.getByLabel('Your practice script')).toHaveValue(
    'This is the draft I want to preserve.',
  );
  await expect(page.getByRole('button', { name: 'Generate a draft' })).toBeEnabled();
});

test('local practice creates no cloud session or upload even when AI is enabled', async ({
  page,
}) => {
  await page.route('**/api/health', (route) =>
    route.fulfill({ json: { ok: true, aiConfigured: true } }),
  );
  const cloudRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/sessions')) cloudRequests.push(request.url());
  });
  await page.goto('/#studio');
  await page
    .getByLabel('Your practice script')
    .fill('A short local practice that stays on my device.');
  await page.getByRole('button', { name: 'Set up my recording' }).click();
  await page.getByRole('button', { name: 'Enable camera & microphone' }).click();
  await expect(page.getByRole('button', { name: 'Start practice' })).toBeEnabled();
  await expect(page.locator('#consent')).not.toBeChecked();
  await page.getByRole('button', { name: 'Start practice' }).click();
  await expect(page.locator('#timer')).not.toHaveText('00:00');
  await expect(page.locator('#live-score')).toHaveText('—');
  await expect(page.locator('#score-explanation')).toContainText('Local practice');
  await page.getByRole('button', { name: 'Finish practice' }).click();
  await expect(page.locator('audio')).toBeVisible();
  await expect(page.getByText(/This was a local practice/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry AI analysis' })).toHaveCount(0);
  expect(cloudRequests).toEqual([]);
});

test('script source tabs support arrow-key selection', async ({ page }) => {
  await page.goto('/#studio');
  await page.getByRole('tab', { name: 'Write my own' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Draft with Gemini' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Draft with Gemini' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Write my own' })).toBeFocused();
});

test('home, about, studio, and setup fit phone and tablet viewports', async ({ page }) => {
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/#about', '/#studio']) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page
      .getByLabel('Your practice script')
      .fill('A practice script that fits every viewport.');
    await page.getByRole('button', { name: 'Set up my recording' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

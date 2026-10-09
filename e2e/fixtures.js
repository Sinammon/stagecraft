// Explicit doubles exercise browser workflows without credentials or paid requests.
export const talkingPoints = [
  { title: 'The main idea', cue: 'Explain why a small daily habit makes learning easier.' },
  { title: 'A concrete example', cue: 'Describe what changes when you repeat one useful action.' },
  { title: 'The takeaway', cue: 'Invite your audience to choose one habit to try.' },
];

export async function mockAIPractice(page) {
  await page.route('**/api/health', (route) =>
    route.fulfill({ json: { ok: true, aiConfigured: true } }),
  );
  await page.route('**/api/sessions', (route) =>
    route.fulfill({ json: { id: 'browser-fixture' } }),
  );
  await page.route('**/api/sessions/browser-fixture', (route) => route.fulfill({ status: 204 }));
  await page.route('**/api/flashcards', (route) =>
    route.fulfill({ json: { points: talkingPoints } }),
  );
}

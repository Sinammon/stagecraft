import { afterEach, expect, it } from 'vitest';
import { buildApp } from '../server/app.js';
import { GeminiProvider } from '../server/gemini.js';
import { flashcardsSchema } from '../shared/flashcards.js';

const points = [
  { title: 'Small habits', cue: 'Explain the value of a regular practice routine.' },
  { title: 'Learning by doing', cue: 'Connect repetition to becoming familiar with a skill.' },
  { title: 'A next step', cue: 'Invite your audience to choose a habit.' },
];
const apps = [];
afterEach(async () => {
  for (const app of apps.splice(0)) await app.close();
});

it('requires consent, bounds scripts, and passes cancellation to the provider', async () => {
  let call;
  const app = await buildApp({
    serveStatic: false,
    provider: {
      key: 'fixture',
      flashcards: async (script, signal) => {
        call = { script, signal };
        return { points };
      },
    },
  });
  apps.push(app);
  let address = 1;
  for (const payload of [
    { script: 'Practice one small habit.' },
    { script: 'Practice one small habit.', cloudConsent: false },
    { script: 'a'.repeat(15001), cloudConsent: true },
    { script: 'oneword', cloudConsent: true },
  ]) {
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/flashcards',
          payload,
          remoteAddress: `127.0.0.${address++}`,
        })
      ).statusCode,
    ).toBe(400);
  }
  expect(call).toBeUndefined();
  const result = await app.inject({
    method: 'POST',
    url: '/api/flashcards',
    payload: {
      script: 'Practice one small habit.',
      cloudConsent: true,
    },
  });
  expect(result.statusCode).toBe(200);
  expect(result.json()).toEqual({ points });
  expect(call.script).toBe('Practice one small habit.');
  expect(call.signal).toBeInstanceOf(AbortSignal);
});

it('does not let missing AI create a recording session', async () => {
  const app = await buildApp({ env: {}, serveStatic: false });
  apps.push(app);
  const result = await app.inject({
    method: 'POST',
    url: '/api/sessions',
    payload: { cloudConsent: true },
  });
  expect(result.statusCode).toBe(503);
  expect(result.json().error).toMatch(/AI practice is unavailable/);
  expect(result.headers['set-cookie']).toBeUndefined();
});

it('rejects incomplete or duplicate cards and supports additional distinct ideas', () => {
  expect(flashcardsSchema.safeParse({ points: points.slice(0, 2) }).success).toBe(false);
  expect(flashcardsSchema.safeParse({ points: [points[0], points[0], points[2]] }).success).toBe(
    false,
  );
  expect(
    flashcardsSchema.safeParse({
      points: [...points, { title: 'A comparison', cue: 'Compare two approaches.' }],
    }).success,
  ).toBe(true);
  expect(
    flashcardsSchema.safeParse({
      points: Array.from({ length: 9 }, (_, i) => ({ title: `${i}`, cue: 'An idea' })),
    }).success,
  ).toBe(false);
});

it('requests synthesized adaptive cards through the existing quota queue and validates output', async () => {
  const provider = new GeminiProvider({ GEMINI_API_KEY: 'fixture' });
  let request, reservation;
  provider.run = (fn, options) => {
    reservation = options;
    return fn();
  };
  provider.ai.interactions.create = async (value) => {
    request = value;
    return { status: 'completed', output_text: JSON.stringify({ points }) };
  };
  const signal = new AbortController().signal;
  expect(await provider.flashcards('Practice one small habit.', signal)).toEqual({ points });
  expect(request.store).toBe(false);
  expect(request.response_format.mime_type).toBe('application/json');
  expect(request.system_instruction).toMatch(/conceptual complexity/);
  expect(request.system_instruction).toMatch(/do not copy sentences/);
  expect(JSON.parse(request.input).script).toBe('Practice one small habit.');
  expect(reservation.signal).toBe(signal);
  expect(reservation.tokens).toBeGreaterThan(1800);
  provider.ai.interactions.create = async () => ({
    status: 'completed',
    output_text: JSON.stringify({ points: [] }),
  });
  await expect(provider.flashcards('Practice one small habit.')).rejects.toMatchObject({
    code: 'INVALID_OUTPUT',
  });
});

it('returns an explicit failure for malformed provider cards', async () => {
  const app = await buildApp({
    serveStatic: false,
    provider: { key: 'fixture', flashcards: async () => ({ points: [] }) },
  });
  apps.push(app);
  const result = await app.inject({
    method: 'POST',
    url: '/api/flashcards',
    payload: { script: 'Practice one small habit.', cloudConsent: true },
  });
  expect(result.statusCode).toBe(500);
  expect(result.json()).not.toHaveProperty('points');
});

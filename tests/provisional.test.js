import { it, expect } from 'vitest';
import { provisionalScore } from '../shared/scoring.js';

it('withholds a live score until both speech and posture support it', () => {
  const data = {
    events: [],
    turns: [{ text: Array(50).fill('word').join(' '), startMs: 0, endMs: 30000 }],
    poseSamples: Array.from({ length: 300 }, (_, i) => ({ timeMs: i * 100, valid: true })),
    liveReady: true,
  };
  expect(provisionalScore(data).score).toBe(100);
  expect(provisionalScore({ ...data, turns: [] }).score).toBeNull();
  expect(provisionalScore({ ...data, poseSamples: [] }).score).toBeNull();
  expect(provisionalScore({ ...data, liveReady: false }).score).toBeNull();
  expect(
    provisionalScore({ ...data, turns: [{ ...data.turns[0], text: 'Too short' }] }).score,
  ).toBeNull();
  expect(provisionalScore({ ...data, events: [{ id: 'one', category: 'filler' }] }).score).toBe(99);
});

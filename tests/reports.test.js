import { expect, it } from 'vitest';
import { parseReport } from '../shared/reports.js';

it('rejects malformed review output before it reaches rendering', () => {
  expect(() =>
    parseReport({ status: 'complete', stages: { audio: { summary: 'Hello' } } }),
  ).toThrow(/recording is safe/);
  expect(() =>
    parseReport({
      status: 'complete',
      stages: {},
      evidence: [{ id: 'bad', category: 'pause', startMs: -1, endMs: 0 }],
    }),
  ).toThrow(/incomplete/);
});
it('accepts partial progress and defaults absent evidence to an empty list', () => {
  const result = parseReport({
    status: 'processing',
    stages: {},
    score: null,
    stageStatus: { transcript: 'running', audio: 'waiting' },
  });
  expect(result.evidence).toEqual([]);
  expect(result.stageStatus.transcript).toBe('running');
});

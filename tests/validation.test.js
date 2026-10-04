import { it, expect } from 'vitest';
import { validateWav, analysisSchema } from '../server/validation.js';
import { wavFromChunks } from '../src/media.js';
it('verifies the actual PCM format and duration instead of trusting MIME headers', async () => {
  const { blob } = wavFromChunks([new Float32Array(16000)]);
  const audio = Buffer.from(await blob.arrayBuffer());
  expect(() => validateWav(audio, 1000)).not.toThrow();
  expect(() => validateWav(audio, 10000)).toThrow(/duration/);
  audio.writeUInt32LE(48000, 24);
  expect(() => validateWav(audio, 1000)).toThrow(/16 kHz/);
  expect(() => validateWav(Buffer.from('not audio'), 1000)).toThrow(/WAV/);
});
it('rejects observations outside the recording and unsorted pose samples', () => {
  const payload = {
    durationMs: 1000,
    mode: 'seated',
    poseSamples: [
      { timeMs: 500, valid: true, deviation: false },
      { timeMs: 0, valid: true, deviation: false },
    ],
    postureEvents: [],
    frames: [],
    acoustics: { pitchVariation: null, relativeLoudness: 0, clippedFraction: 0 },
  };
  expect(analysisSchema.safeParse(payload).success).toBe(false);
  payload.poseSamples = [];
  payload.frames = [{ timeMs: 2000, data: 'data:image/jpeg;base64,AAA=' }];
  expect(analysisSchema.safeParse(payload).success).toBe(false);
});

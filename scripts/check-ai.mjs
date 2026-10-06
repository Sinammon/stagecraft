import { readFile } from 'node:fs/promises';
import { buildApp } from '../server/app.js';
import { GeminiProvider } from '../server/gemini.js';
import { validateWav } from '../server/validation.js';

// Explicit, credentialed check. No transcripts, recordings, or provider bodies are logged.
const provider = new GeminiProvider();
if (!provider.key) {
  console.error(
    'Live AI check cannot run: configure GEMINI_API_KEY in the server environment or .env.',
  );
  process.exit(1);
}
if (!process.env.AI_TEST_AUDIO_PATH) {
  console.error(
    'Set AI_TEST_AUDIO_PATH to a non-sensitive mono 16 kHz, 16-bit PCM WAV before running this cloud-processing check.',
  );
  process.exit(1);
}
const audio = await readFile(process.env.AI_TEST_AUDIO_PATH);
let durationMs;
for (let offset = 12; offset + 8 <= audio.length; ) {
  const size = audio.readUInt32LE(offset + 4);
  if (audio.toString('ascii', offset, offset + 4) === 'data') durationMs = size / 32;
  offset += 8 + size + (size % 2);
}
validateWav(audio, durationMs);
const app = await buildApp({ provider, serveStatic: false });
let id, cookie;
const request = async (options) => {
  const response = await app.inject({ ...options, headers: { cookie, ...options.headers } });
  if (response.statusCode >= 400) throw new Error(response.json().error);
  return response;
};
try {
  const draft = (
    await request({
      method: 'POST',
      url: '/api/scripts',
      payload: {
        topic: 'A small habit that helps me learn',
        audience: 'My classmates',
        duration: 1,
      },
    })
  ).json();
  if (!draft.script?.trim()) throw new Error('Script generation returned no text.');
  console.log('PASS: live Gemini script generation through the API.');
  const created = await request({
    method: 'POST',
    url: '/api/sessions',
    payload: { cloudConsent: true },
  });
  id = created.json().id;
  cookie = created.headers['set-cookie'].split(';')[0];
  const frames = [];
  if (process.env.AI_TEST_FRAME_PATH) {
    const frame = await readFile(process.env.AI_TEST_FRAME_PATH);
    frames.push({ timeMs: 0, data: `data:image/jpeg;base64,${frame.toString('base64')}` });
  }
  const payload = {
    durationMs,
    mode: 'seated',
    poseSamples: [],
    postureEvents: [],
    frames,
    acoustics: { pitchVariation: null, relativeLoudness: 0, clippedFraction: 0 },
  };
  const boundary = 'stagecraft-live-check';
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="payload"\r\n\r\n${JSON.stringify(payload)}\r\n--${boundary}\r\nContent-Disposition: form-data; name="audio"; filename="practice.wav"\r\nContent-Type: audio/wav\r\n\r\n`,
    ),
    audio,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  await request({
    method: 'POST',
    url: `/api/sessions/${id}/analyze`,
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: body,
  });
  const deadline = Date.now() + 600000;
  let report;
  do {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    report = (await request({ url: `/api/sessions/${id}/report` })).json();
    if (Date.now() > deadline) throw new Error('Live analysis did not finish within ten minutes.');
  } while (report.status === 'processing');
  if (report.status !== 'complete' || !report.words?.length)
    throw new Error(report.error || 'Live review was incomplete.');
  if (report.cleanupWarning) throw new Error(report.cleanupWarning);
  console.log(
    'PASS: upload, word-timed transcription, isolated audio/visual reviews, combined review, and provider file cleanup.',
  );
  const chat = await request({
    method: 'POST',
    url: `/api/sessions/${id}/chat`,
    payload: { message: 'Give me one short exercise to practice next.' },
  });
  const events = chat.body
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  if (!events.some((e) => e.text) || !events.some((e) => e.done) || events.some((e) => e.error))
    throw new Error('Live coaching stream did not complete.');
  console.log('PASS: streamed coaching through the API.');
  console.log(
    'Live WebSocket transcription and real-device calibration still need a browser recording check.',
  );
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  audio.fill(0);
  if (id) await request({ method: 'DELETE', url: `/api/sessions/${id}` }).catch(() => {});
  await app.close();
}

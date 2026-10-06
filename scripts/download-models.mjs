import { mkdir, writeFile, copyFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
await mkdir('public/models', { recursive: true });
await mkdir('public/wasm', { recursive: true });
const source = 'node_modules/@mediapipe/tasks-vision/wasm';
for (const file of await readdir(source))
  await copyFile(join(source, file), join('public/wasm', file));
const url =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';
const modelPath = 'public/models/pose_landmarker_lite.task';
const installed = await stat(modelPath).catch(() => null);
if (!installed || installed.size < 1000000) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Model download failed (${response.status}).`);
  const data = new Uint8Array(await response.arrayBuffer());
  if (data.length < 1000000) throw new Error('Model download was incomplete. Please retry.');
  await writeFile(modelPath, data);
}
console.log('MediaPipe Lite model and matching WASM installed locally.');

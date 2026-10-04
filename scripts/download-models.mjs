import { mkdir, writeFile, copyFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
await mkdir('public/models', { recursive: true });
await mkdir('public/wasm', { recursive: true });
const source = 'node_modules/@mediapipe/tasks-vision/wasm';
for (const file of await readdir(source))
  await copyFile(join(source, file), join('public/wasm', file));
const url =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';
const response = await fetch(url);
if (!response.ok) throw new Error(`Model download failed (${response.status}).`);
await writeFile(
  'public/models/pose_landmarker_lite.task',
  new Uint8Array(await response.arrayBuffer()),
);
console.log('MediaPipe Lite model and matching WASM installed locally.');

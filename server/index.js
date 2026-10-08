import { buildApp } from './app.js';
const app = await buildApp();
await app.listen({ port: Number(process.env.PORT) || 3000, host: process.env.HOST || '127.0.0.1' });
console.log(`Heard: ${process.env.APP_ORIGIN || 'http://localhost:3000'}`);
console.log(
  process.env.GEMINI_API_KEY
    ? 'Gemini configured. Check project quotas before cloud processing.'
    : 'Recording works locally. Add GEMINI_API_KEY to .env for AI features.',
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    void app.close().then(() => process.exit(0));
  });

import { buildApp } from './server/app.js';

const app = await buildApp();

await app.listen({
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
});

console.log(`Heard: ${process.env.APP_ORIGIN || 'Vercel deployment'}`);
console.log(
  process.env.GEMINI_API_KEY
    ? 'Gemini configured. Check project quotas before cloud processing.'
    : 'Recording works locally. Add GEMINI_API_KEY to Vercel for AI features.',
);

import { buildApp } from '../server/app.js';

let appPromise;

async function getApp() {
  appPromise ||= buildApp();
  const app = await appPromise;
  await app.ready();
  return app;
}

export default async function handler(request, response) {
  try {
    const app = await getApp();
    app.server.emit('request', request, response);
  } catch (error) {
    console.error('Heard API initialization failed:', error);
    if (!response.headersSent) {
      response.statusCode = 500;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ error: 'Heard API failed to start.' }));
    } else {
      response.end();
    }
  }
}

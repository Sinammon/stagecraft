import { buildApp } from '../server/app.js';

let appPromise;

async function getApp() {
  appPromise ||= buildApp();
  const app = await appPromise;
  await app.ready();
  return app;
}

export default async function handler(request, response) {
  const app = await getApp();
  app.server.emit('request', request, response);
}

import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    channel: 'msedge',
    launchOptions: {
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
    permissions: ['camera', 'microphone'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node server/index.js',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: !process.env.CI,
  },
});

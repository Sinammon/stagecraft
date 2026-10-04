import { defineConfig } from 'vite';
export default defineConfig({
  worker: { format: 'iife', rollupOptions: { output: { inlineDynamicImports: true } } },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:3000', ws: true } },
  },
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.js'], testTimeout: 10000 },
});

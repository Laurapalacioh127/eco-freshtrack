import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // With the default pools, Vitest 5 fails every file but the first with "failed to
    // find the current suite" in setup.ts when several files run; vmThreads keeps
    // per-file isolation and one jsdom per worker.
    pool: 'vmThreads',
    setupFiles: ['./test/setup.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});

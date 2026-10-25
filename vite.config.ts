import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, host: true, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: { target: 'es2022' },
  test: {
    environment: 'happy-dom',
    env: { TZ: 'America/Los_Angeles' },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

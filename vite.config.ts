import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

const csp = (): Plugin => ({
  name: 'csp',
  apply: 'build',
  transformIndexHtml: () => [
    {
      tag: 'meta',
      attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
      injectTo: 'head-prepend',
    },
  ],
});

export default defineConfig({
  base: './',
  plugins: [react(), csp()],
  server: { port: 5173, host: true, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: { target: 'es2022' },
  test: {
    environment: 'happy-dom',
    env: { TZ: 'America/Los_Angeles' },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
      reporter: ['text-summary', 'text', 'html'],
      thresholds: { statements: 95, branches: 90, functions: 95, lines: 95 },
    },
  },
});

/// <reference types="vitest" />
import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['app/lib/**', 'app/controllers/**', 'app/views/**'],
      exclude: ['app/**/*.test.*'],
    },
  },
});

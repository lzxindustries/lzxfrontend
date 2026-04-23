/// <reference types="vitest" />
import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths() as any],
  test: {
    globals: true,
    // `jsdom` 29+ pulls `html-encoding-sniffer` 6, which depends on
    // pure-ESM `@exodus/bytes` while Vitest still loads the chain via
    // CommonJS `require`, producing "require() of ES Module" failures.
    // `happy-dom` is sufficient for @testing-library/react and avoids
    // that entire dependency path.
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['app/lib/**', 'app/controllers/**', 'app/views/**'],
      exclude: ['app/**/*.test.*'],
    },
  },
});

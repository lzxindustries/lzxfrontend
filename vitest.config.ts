/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig, type UserConfig} from 'vitest/config';

export default defineConfig({
  // `vite-tsconfig-paths` is typed against the app Vite; Vitest bundles another Vite—types do not unify.
  plugins: [tsconfigPaths() as NonNullable<UserConfig['plugins']>[number]],
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
      include: [
        'app/lib/**',
        'app/data/**',
        'app/hooks/**',
        'app/components/**',
      ],
      exclude: ['app/**/*.test.*'],
    },
  },
});

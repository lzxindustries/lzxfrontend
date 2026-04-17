import {defineConfig, devices} from '@playwright/test';

const env = process.env as Record<string, string | undefined>;
const ci = !!env.CI;
const webServerCommand = 'yarn run preview';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  workers: ci ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  /* Snapshot directory for visual regression baselines */
  snapshotDir: './e2e/__snapshots__',
  expect: {
    toHaveScreenshot: {
      /* Allow slight anti-aliasing differences across environments */
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    /* ── Desktop Browsers ─────────────────────────────── */
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
    },

    /* ── Mobile Devices ───────────────────────────────── */
    {
      name: 'mobile-chrome',
      use: {...devices['Pixel 5']},
    },
    {
      name: 'mobile-safari',
      use: {...devices['iPhone 13']},
    },

    /* ── Tablet ───────────────────────────────────────── */
    {
      name: 'tablet',
      use: {...devices['iPad (gen 7)']},
    },

    /* ── Custom Viewport Breakpoints (Tailwind) ───────── */
    {
      name: 'viewport-sm',
      use: {
        browserName: 'chromium',
        viewport: {width: 512, height: 900},
      },
    },
    {
      name: 'viewport-md',
      use: {
        browserName: 'chromium',
        viewport: {width: 768, height: 1024},
      },
    },
    {
      name: 'viewport-lg',
      use: {
        browserName: 'chromium',
        viewport: {width: 1024, height: 768},
      },
    },
    {
      name: 'viewport-xl',
      use: {
        browserName: 'chromium',
        viewport: {width: 1280, height: 900},
      },
    },
    {
      name: 'viewport-2xl',
      use: {
        browserName: 'chromium',
        viewport: {width: 1536, height: 960},
      },
    },
  ],
  webServer: {
    command: webServerCommand,
    url: 'http://localhost:3000',
    reuseExistingServer: !ci,
    timeout: 120000,
  },
});

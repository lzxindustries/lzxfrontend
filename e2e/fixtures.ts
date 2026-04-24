import {type Page, type BrowserContext, expect} from '@playwright/test';

// ---------------------------------------------------------------------------
// Common test URLs & slugs
// ---------------------------------------------------------------------------

export const URLS = {
  home: '/',
  products: '/products',
  collections: '/collections',
  cart: '/cart',
  search: '/search',
  login: '/account/login',
  register: '/account/register',
  policies: '/policies',

  // Modules
  modulesIndex: '/modules',
  moduleDetail: '/modules/esg3',
  moduleSpecs: '/modules/esg3/specs',
  moduleDownloads: '/modules/esg3/downloads',
  moduleVideos: '/modules/esg3/videos',
  modulePatches: '/modules/esg3/patches',

  // Instruments
  instrumentsIndex: '/instruments',
  instrumentDetail: '/instruments/videomancer',
  instrumentDownloads: '/instruments/videomancer/downloads',

  // Blog / Journal
  blogIndex: '/blog',
  journalIndex: '/journal',

  // Documentation
  docsIndex: '/docs',
  gettingStarted: '/getting-started',

  // Community
  patchesIndex: '/patches',
  patchDetail: '/patches/feedback-cartoon',
  glossary: '/docs/guides/glossary',
  artists: '/artists',

  // Shopping
  catalog: '/catalog',
  systems: '/systems',
  downloads: '/downloads',
  legacy: '/legacy',

  // Utility
  about: '/about',
  support: '/support',
  connect: '/connect',
  wishlist: '/wishlist',

  // API
  apiCountries: '/api/countries',
  apiProducts: '/api/products',
  apiPredictiveSearch: '/api/predictive-search',
  apiNotifyMe: '/api/notify-me',

  // SEO
  sitemap: '/sitemap.xml',
  robots: '/robots.txt',
  rss: '/blog.rss.xml',
} as const;

// ---------------------------------------------------------------------------
// Console error collector
// ---------------------------------------------------------------------------

/**
 * Attach an error listener to the page and return a handle that can be
 * queried later.  Ignores benign browser warnings.
 */
export function trackConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on('pageerror', (err) => {
    // Ignore known noisy errors from third-party scripts
    const msg = err.message ?? String(err);
    if (
      msg.includes('ResizeObserver loop') ||
      msg.includes('Non-Error promise rejection')
    ) {
      return;
    }
    errors.push(msg);
  });

  return {
    get errors() {
      return errors;
    },
    expectNone() {
      if (errors.length > 0) {
        throw new Error(
          `Unexpected console errors:\n${errors
            .map((e) => `  • ${e}`)
            .join('\n')}`,
        );
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Navigate and wait until the page is fully loaded. */
export async function gotoReady(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Assert the page returned a 2xx status, rendered without JS errors, and
 * shows a visible `<main>` element (or `<body>` as fallback).
 */
export async function assertPageLoads(page: Page, url: string) {
  const tracker = trackConsoleErrors(page);
  const response = await page.goto(url);
  await page.waitForLoadState('networkidle');

  expect(response?.status()).toBeLessThan(400);

  // Every route should render either <main> or at minimum a visible <body>.
  const main = page.locator('main');
  if ((await main.count()) > 0) {
    await expect(main.first()).toBeVisible();
  } else {
    await expect(page.locator('body')).toBeVisible();
  }

  tracker.expectNone();
}

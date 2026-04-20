import {test, expect} from '@playwright/test';

/**
 * Visual regression tests — capture full-page screenshots and compare against
 * stored baselines.  Run `npx playwright test --update-snapshots` to create /
 * update the reference images after intentional design changes.
 *
 * These tests run across ALL projects defined in playwright.config.ts
 * (Chromium, Firefox, WebKit, mobile, tablet, every Tailwind breakpoint),
 * so each page automatically gets cross-browser + multi-resolution coverage.
 */

const KEY_PAGES = [
  {name: 'homepage', path: '/'},
  {name: 'products', path: '/products'},
  {name: 'collections', path: '/collections'},
  {name: 'search', path: '/search'},
  {name: 'cart', path: '/cart'},
  {name: 'login', path: '/account/login'},
  {name: 'policies', path: '/policies'},
  {name: 'modules', path: '/modules'},
  {name: 'module-detail', path: '/modules/esg3'},
  {name: 'instruments', path: '/instruments'},
  {name: 'instrument-detail', path: '/instruments/videomancer'},
  {name: 'blog', path: '/blog'},
  {name: 'patches', path: '/patches'},
  {name: 'glossary', path: '/glossary'},
  {name: 'docs', path: '/docs'},
  {name: 'getting-started', path: '/getting-started'},
  {name: 'support', path: '/support'},
  {name: 'systems', path: '/systems'},
  {name: 'catalog', path: '/catalog'},
  {name: 'downloads', path: '/downloads'},
];

for (const {name, path} of KEY_PAGES) {
  test(`visual regression — ${name}`, async ({page}) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    // Wait for web fonts + images to settle
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      // Mask dynamic content that changes between runs
      mask: [
        page.locator('iframe'), // YouTube embeds
        page.locator('video'), // Background videos
        page.locator('time'), // Timestamps
        page.locator('[data-testid="price"]'), // Prices that may change
        page.locator('.badge'), // Stock/status badges
      ],
    });
  });
}

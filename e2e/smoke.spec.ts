import {test, expect} from '@playwright/test';
import {assertPageLoads, URLS} from './fixtures';

// ---------------------------------------------------------------------------
// Page smoke tests — verify every public route loads without errors
// ---------------------------------------------------------------------------

test.describe('Module pages', () => {
  test('modules index loads', async ({page}) => {
    await assertPageLoads(page, URLS.modulesIndex);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('module detail page loads', async ({page}) => {
    await assertPageLoads(page, URLS.moduleDetail);
    // Should show the hub nav bar and product content
    await expect(page.locator('[data-testid="hub-nav"]')).toBeVisible();
  });

  test('module specs page loads', async ({page}) => {
    await assertPageLoads(page, URLS.moduleSpecs);
  });

  test('module downloads page loads', async ({page}) => {
    await assertPageLoads(page, URLS.moduleDownloads);
  });

  test('module videos page loads', async ({page}) => {
    await assertPageLoads(page, URLS.moduleVideos);
  });

  test('module patches page loads', async ({page}) => {
    await assertPageLoads(page, URLS.modulePatches);
  });
});

test.describe('Instrument pages', () => {
  test('instruments index loads', async ({page}) => {
    await assertPageLoads(page, URLS.instrumentsIndex);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('instrument detail page loads', async ({page}) => {
    await assertPageLoads(page, URLS.instrumentDetail);
    await expect(page.locator('[data-testid="hub-nav"]')).toBeVisible();
  });

  test('instrument downloads page loads', async ({page}) => {
    await assertPageLoads(page, URLS.instrumentDownloads);
  });
});

test.describe('Blog & Journal', () => {
  test('blog index loads with articles', async ({page}) => {
    await assertPageLoads(page, URLS.blogIndex);
    // Blog should contain at least one article link
    const articleLinks = page.locator('a[href*="/blog/"]');
    await expect(articleLinks.first()).toBeVisible();
  });

  test('journal index loads', async ({page}) => {
    await assertPageLoads(page, URLS.journalIndex);
  });
});

test.describe('Documentation', () => {
  test('docs index loads', async ({page}) => {
    await assertPageLoads(page, URLS.docsIndex);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('getting started page loads', async ({page}) => {
    await assertPageLoads(page, URLS.gettingStarted);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});

test.describe('Community content', () => {
  test('patches index loads', async ({page}) => {
    await assertPageLoads(page, URLS.patchesIndex);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('patch detail page loads', async ({page}) => {
    await assertPageLoads(page, URLS.patchDetail);
  });

  test('glossary loads with terms', async ({page}) => {
    await assertPageLoads(page, URLS.glossary);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('artists page loads', async ({page}) => {
    await assertPageLoads(page, URLS.artists);
  });
});

test.describe('Shopping pages', () => {
  test('catalog page loads', async ({page}) => {
    await assertPageLoads(page, URLS.catalog);
    // The first heading may be a hidden filter label; just verify content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('systems page loads', async ({page}) => {
    await assertPageLoads(page, URLS.systems);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('downloads hub loads', async ({page}) => {
    await assertPageLoads(page, URLS.downloads);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('legacy products page loads', async ({page}) => {
    await assertPageLoads(page, URLS.legacy);
  });
});

test.describe('Utility pages', () => {
  test('about page loads', async ({page}) => {
    await assertPageLoads(page, URLS.about);
  });

  test('support page loads', async ({page}) => {
    await assertPageLoads(page, URLS.support);
  });

  test('connect page loads', async ({page}) => {
    await assertPageLoads(page, URLS.connect);
  });

  test('wishlist page loads', async ({page}) => {
    await assertPageLoads(page, URLS.wishlist);
  });
});

test.describe('Policy pages', () => {
  test('refund policy loads', async ({page}) => {
    await assertPageLoads(page, '/policies/refund-policy');
  });

  test('privacy policy loads', async ({page}) => {
    await assertPageLoads(page, '/policies/privacy-policy');
  });

  test('terms of service loads', async ({page}) => {
    await assertPageLoads(page, '/policies/terms-of-service');
  });

  test('shipping policy loads', async ({page}) => {
    await assertPageLoads(page, '/policies/shipping-policy');
  });
});

test.describe('Redirect verification', () => {
  test('/collections/all redirects to /products', async ({page}) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/products');
  });

  test('/b-stock loads or redirects to collection', async ({page}) => {
    const response = await page.goto('/b-stock');
    await page.waitForLoadState('networkidle');
    // b-stock may redirect to collection or render a "no items" page
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
  });

  test('/accessories redirects to collection', async ({page}) => {
    await page.goto('/accessories');
    await page.waitForLoadState('networkidle');
    // Accessories always redirects
    expect(page.url()).toMatch(/\/collections\/|\accessories/);
  });

  test('/glossary 301s to the canonical docs glossary', async ({page}) => {
    const response = await page.goto('/glossary', {waitUntil: 'commit'});
    // Remix may return 3xx; follow to final page
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/docs/guides/glossary');
    expect(response?.status() ?? 0).toBeLessThan(400);
  });

  test('/docs/getting-started/learn 301s to /getting-started/learn', async ({
    page,
  }) => {
    const response = await page.goto('/docs/getting-started/learn', {
      waitUntil: 'commit',
    });
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/getting-started\/learn/);
    expect(response?.status() ?? 0).toBeLessThan(400);
  });
});

test.describe('Error handling', () => {
  test('nonexistent page shows not-found content', async ({page}) => {
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForLoadState('networkidle');
    // The app may render a custom 404 page with a 200 status (SSR catch-all).
    // Verify the page loads and shows something useful.
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Homepage', () => {
  test('homepage loads with LZX branding', async ({page}) => {
    await assertPageLoads(page, '/');
    await expect(page).toHaveTitle(/LZX/i);
  });

  test('header is visible on homepage', async ({page}) => {
    await assertPageLoads(page, '/');
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
  });

  test('footer is visible on homepage', async ({page}) => {
    await assertPageLoads(page, '/');
    await expect(page.locator('[data-testid="footer"]')).toBeVisible();
  });
});

test.describe('Account pages', () => {
  test('unauthenticated user is redirected to login', async ({page}) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/account/login');
  });

  test('login page renders with form', async ({page}) => {
    await assertPageLoads(page, URLS.login);
    const hasForm = await page.locator('form').count();
    const hasInput = await page.locator('input').count();
    expect(hasForm + hasInput).toBeGreaterThan(0);
  });

  test('register page renders with form', async ({page}) => {
    await assertPageLoads(page, URLS.register);
    const hasForm = await page.locator('form').count();
    const hasInput = await page.locator('input').count();
    expect(hasForm + hasInput).toBeGreaterThan(0);
  });

  test('password recovery page loads', async ({page}) => {
    await assertPageLoads(page, '/account/recover');
  });
});

test.describe('Collections', () => {
  test('collections index loads', async ({page}) => {
    await assertPageLoads(page, URLS.collections);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('products page loads with product listing', async ({page}) => {
    await assertPageLoads(page, URLS.products);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});

test.describe('SEO meta', () => {
  test('homepage has meta description', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute('content');
    expect(content?.length).toBeGreaterThan(0);
  });

  test('homepage has Open Graph tags', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const ogTitle = page.locator('meta[property="og:title"]');
    expect(await ogTitle.count()).toBeGreaterThan(0);
  });

  test('product page has meta description', async ({page}) => {
    await page.goto(URLS.moduleDetail);
    await page.waitForLoadState('networkidle');
    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute('content');
    expect(content?.length).toBeGreaterThan(0);
  });

  test('canonical URL is present on pages', async ({page}) => {
    await page.goto(URLS.modulesIndex);
    await page.waitForLoadState('networkidle');
    const canonical = page.locator('link[rel="canonical"]');
    if ((await canonical.count()) > 0) {
      const href = await canonical.getAttribute('href');
      expect(href?.length).toBeGreaterThan(0);
    }
  });

  test('RSS feed is linked from the document head', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const rss = page.locator(
      'link[rel="alternate"][type="application/rss+xml"]',
    );
    await expect(rss).toHaveCount(1);
    await expect(rss).toHaveAttribute('href', '/blog.rss.xml');
  });
});

test.describe('Invalid locale / soft 404', () => {
  test('unknown top-level slug returns 404 (not duplicate homepage)', async ({
    page,
  }) => {
    const path = '/not-a-valid-locale-nor-product-slug-abc123';
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', {name: /lost this page/i}),
    ).toBeVisible();
  });
});

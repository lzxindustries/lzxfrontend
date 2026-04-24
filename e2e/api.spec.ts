import {test, expect} from '@playwright/test';
import {URLS} from './fixtures';

// ---------------------------------------------------------------------------
// API endpoint contract tests — validates response shape and status codes.
// Uses Playwright's `request` fixture (no browser needed).
// ---------------------------------------------------------------------------

test.describe('Countries API', () => {
  test('countries route returns country data', async ({page}) => {
    // This is a Remix UI route (has default export), so direct fetch returns
    // HTML. Navigate to the page and check the loader data is embedded.
    const response = await page.goto(URLS.apiCountries);
    expect(response?.status()).toBe(200);
    // The HTML page should contain serialized country codes
    const html = await page.content();
    expect(html).toMatch(/"US"|"CA"|"GB"/);
  });
});

test.describe('Products API', () => {
  test('products route returns product data', async ({page}) => {
    // This is a Remix UI route (has default export), so direct fetch returns
    // HTML. Navigate to the page and check the loader data is embedded.
    const response = await page.goto(
      `${URLS.apiProducts}?sortKey=BEST_SELLING&count=4`,
    );
    expect(response?.status()).toBe(200);
    // The HTML page should contain serialized product data
    const html = await page.content();
    expect(html).toContain('products');
    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Predictive Search API', () => {
  test('returns sectioned results for a valid query', async ({request}) => {
    const response = await request.get(`${URLS.apiPredictiveSearch}?q=video`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Response should have the four result sections
    expect(body).toHaveProperty('products');
    expect(body).toHaveProperty('collections');
    expect(body).toHaveProperty('pages');
    expect(body).toHaveProperty('articles');

    expect(Array.isArray(body.products)).toBe(true);
    expect(Array.isArray(body.collections)).toBe(true);
  });

  test('returns empty results for empty query', async ({request}) => {
    const response = await request.get(`${URLS.apiPredictiveSearch}?q=`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Should still have the expected shape, even if arrays are empty
    expect(body).toHaveProperty('products');
    expect(Array.isArray(body.products)).toBe(true);
  });
});

test.describe('Notify-Me API', () => {
  test('rejects an invalid email', async ({request}) => {
    const response = await request.post(URLS.apiNotifyMe, {
      form: {
        email: 'not-an-email',
        handle: 'esg3',
        variantId: 'gid://shopify/ProductVariant/00000000',
      },
    });
    // Should return 200 with ok: false (validation error, not HTTP error)
    expect(response.status()).toBeLessThan(500);

    const body = await response.json();
    expect(body).toHaveProperty('ok');
    expect(body).toHaveProperty('message');
    expect(body.ok).toBe(false);
  });

  test('response has expected shape with valid email', async ({request}) => {
    const response = await request.post(URLS.apiNotifyMe, {
      form: {
        email: 'playwright-test@example.com',
        handle: 'esg3',
        variantId: 'gid://shopify/ProductVariant/00000000',
      },
    });
    // May return 502 if Klaviyo rejects the fake variant ID
    expect(response.status()).toBeLessThan(503);

    const body = await response.json();
    expect(body).toHaveProperty('ok');
    expect(body).toHaveProperty('message');
    expect(typeof body.ok).toBe('boolean');
    expect(typeof body.message).toBe('string');
  });
});

test.describe('SEO endpoints', () => {
  test('sitemap.xml returns valid XML', async ({request}) => {
    const response = await request.get(URLS.sitemap);
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('<urlset');
  });

  test('robots.txt contains User-agent directive', async ({request}) => {
    const response = await request.get(URLS.robots);
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('User-agent');
    expect(body).toContain('Disallow');
  });

  test('blog RSS feed returns valid XML', async ({request}) => {
    const response = await request.get(URLS.rss);
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('<rss');
  });
});

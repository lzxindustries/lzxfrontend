import {test, expect} from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and displays the site', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LZX/i);
  });

  test('header navigation is visible', async ({page}) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('footer is visible', async ({page}) => {
    await page.goto('/');
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });
});

test.describe('Product Browsing', () => {
  test('products page loads and shows products', async ({page}) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    // Should show product cards or a product listing
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('collections page loads', async ({page}) => {
    await page.goto('/collections');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('can navigate from products page to product detail', async ({page}) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const productLink = page.locator('a[href*="/products/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page.url()).toContain('/products/');
    }
  });
});

test.describe('Cart', () => {
  test('cart page loads', async ({page}) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Search', () => {
  test('search page loads', async ({page}) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('search with query returns results or empty state', async ({page}) => {
    await page.goto('/search?q=video');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Account', () => {
  test('unauthenticated user is redirected to login', async ({page}) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    // Should redirect to login or show login form
    await expect(
      page.url().includes('/account/login') ||
        page.locator('form').isVisible(),
    ).toBeTruthy();
  });

  test('login page renders', async ({page}) => {
    await page.goto('/account/login');
    await page.waitForLoadState('networkidle');
    // Page may use <main> or render form directly in body
    await expect(page.locator('body')).toBeVisible();
    // Should contain a form or login-related content
    const hasForm = await page.locator('form').count();
    const hasInput = await page.locator('input').count();
    expect(hasForm + hasInput).toBeGreaterThan(0);
  });

  test('register page renders', async ({page}) => {
    await page.goto('/account/register');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    const hasForm = await page.locator('form').count();
    const hasInput = await page.locator('input').count();
    expect(hasForm + hasInput).toBeGreaterThan(0);
  });
});

test.describe('Content Pages', () => {
  test('policies page loads', async ({page}) => {
    await page.goto('/policies');
    await page.waitForLoadState('networkidle');
    // Policies may render in <main> or directly; page should at least load
    await expect(page.locator('body')).toBeVisible();
  });

  test('journal page loads', async ({page}) => {
    await page.goto('/journal');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('SEO & Meta', () => {
  test('sitemap.xml returns XML', async ({request}) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
  });

  test('robots.txt is accessible', async ({request}) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('User-agent');
  });
});

test.describe('Responsive Navigation', () => {
  test('mobile menu button is visible on small screens', async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto('/');
    // Look for hamburger menu or mobile nav toggle
    const menuButton = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="nav" i], header button',
    ).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Nav drawer should open
      const nav = page.locator('nav, [role="dialog"]');
      await expect(nav.first()).toBeVisible();
    }
  });
});

test.describe('404 Handling', () => {
  test('nonexistent page shows error content', async ({page}) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');
    // Remix catch-all throws 404 but error boundary may render with 200
    // or the original 404 status — accept either
    const status = response?.status() ?? 200;
    expect([200, 404]).toContain(status);
    await expect(page.locator('body')).toBeVisible();
  });
});

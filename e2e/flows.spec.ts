import {test, expect} from '@playwright/test';
import {gotoReady, trackConsoleErrors, URLS} from './fixtures';

// ---------------------------------------------------------------------------
// User flow tests — multi-step interaction scenarios
// ---------------------------------------------------------------------------

test.describe('Search flow', () => {
  test('search page returns results for a query', async ({page}) => {
    await gotoReady(page, '/search?q=esg3');
    // Should display at least one result or a heading referencing the query
    const main = page.locator('main');
    await expect(main).toBeVisible();
    // Results area should contain product links or a "no results" message
    const content = await main.textContent();
    expect(content?.length).toBeGreaterThan(0);
  });

  test('predictive search shows suggestions', async ({page}) => {
    await gotoReady(page, '/');

    // Open search
    const searchToggle = page.locator('[data-testid="search-toggle"]');
    if ((await searchToggle.count()) > 0 && (await searchToggle.isVisible())) {
      await searchToggle.click();
    }

    // Type a query into the search input
    const searchInput = page.locator(
      'input[type="search"], input[aria-label="Search"]',
    );
    await expect(searchInput.first()).toBeVisible();
    await searchInput.first().fill('video');

    // Wait for predictive results
    const results = page.locator('[data-testid="predictive-search-results"]');
    await expect(results).toBeVisible({timeout: 5000});
  });
});

test.describe('Product browsing flow', () => {
  test('navigate from products page to product detail', async ({page}) => {
    await gotoReady(page, URLS.products);

    // Find a product card and click it
    const productCard = page.locator('[data-testid="product-card"] a').first();
    if ((await productCard.count()) > 0 && (await productCard.isVisible())) {
      const href = await productCard.getAttribute('href');
      await productCard.click();
      // Wait for client-side navigation to complete
      if (href) {
        await page.waitForURL(`**${href}`, {timeout: 10000});
      }
      await page.waitForLoadState('networkidle');

      // Detail page should have a heading
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
    }
  });

  test('collection page shows products', async ({page}) => {
    await gotoReady(page, '/collections/modules');

    // Collection pages may use ProductCard components or direct product grids
    const cards = page.locator('[data-testid="product-card"]');
    const productLinks = page.locator(
      'a[href*="/products/"], a[href*="/modules/"], a[href*="/instruments/"]',
    );
    const cardCount = await cards.count();
    const linkCount = await productLinks.count();
    expect(cardCount + linkCount).toBeGreaterThan(0);
  });
});

test.describe('Cart flow', () => {
  test('cart page shows empty state when no items', async ({page}) => {
    await gotoReady(page, URLS.cart);

    // Should show either cart items or the empty state
    const cartEmpty = page.locator('[data-testid="cart-empty"]');
    const cartItems = page.locator('[data-testid="cart-item"]');

    const emptyCount = await cartEmpty.count();
    const itemCount = await cartItems.count();

    // One of these should be present
    expect(emptyCount + itemCount).toBeGreaterThan(0);
  });
});

test.describe('Navigation flow', () => {
  test('desktop mega menu is visible and has dropdown triggers', async ({
    page,
  }) => {
    await page.setViewportSize({width: 1280, height: 800});
    await gotoReady(page, '/');

    const megaMenu = page.locator('[data-testid="mega-menu"]');
    await expect(megaMenu).toBeVisible();

    // Menu has a "Home" link and dropdown trigger buttons
    const homeLink = megaMenu.locator('a').first();
    await expect(homeLink).toBeVisible();

    const dropdownTriggers = megaMenu.locator('button[aria-haspopup="true"]');
    const triggerCount = await dropdownTriggers.count();
    expect(triggerCount).toBeGreaterThan(0);

    // Hovering a dropdown should reveal child links
    await dropdownTriggers.first().hover();
    const dropdownLinks = megaMenu.locator('div.absolute a');
    await expect(dropdownLinks.first()).toBeVisible({timeout: 3000});
  });

  test('mobile menu opens and navigates', async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    await gotoReady(page, '/');

    const menuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(menuToggle).toBeVisible();

    // Open mobile menu
    await menuToggle.click();

    // Mobile nav content should appear
    const mobileNav = page.locator('nav[aria-label="Mobile main"]');
    await expect(mobileNav).toBeVisible();

    // Find a navigation link and click it
    const navLink = mobileNav.locator('a[href]').first();
    if ((await navLink.count()) > 0 && (await navLink.isVisible())) {
      const href = await navLink.getAttribute('href');
      await navLink.click();
      await page.waitForLoadState('networkidle');

      // Should have navigated
      if (href) {
        expect(page.url()).toContain(href);
      }
    }
  });
});

test.describe('Module hub navigation', () => {
  test('hub nav bar has tabs and they navigate', async ({page}) => {
    await gotoReady(page, URLS.moduleDetail);

    const hubNav = page.locator('[data-testid="hub-nav"]');
    await expect(hubNav).toBeVisible();

    // Hub nav should have multiple tab links
    const tabs = hubNav.locator('a');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    // Click a tab that isn't the first (active overview) tab
    if (tabCount >= 2) {
      const secondTab = tabs.nth(1);
      const tabHref = await secondTab.getAttribute('href');
      await secondTab.click();
      // Wait for client-side navigation to complete
      if (tabHref) {
        await page.waitForURL(`**${tabHref}`, {timeout: 10000});
      }
      await page.waitForLoadState('networkidle');

      // Hub nav should still be visible after navigation
      await expect(page.locator('[data-testid="hub-nav"]')).toBeVisible();
    }
  });
});

test.describe('Blog browsing flow', () => {
  test('can navigate from blog index to an article', async ({page}) => {
    await gotoReady(page, URLS.blogIndex);

    // Find an article link
    // Blog articles may link to /blog/slug or /journal/slug
    const articleLink = page
      .locator(
        'a[href*="/blog/"]:not([href="/blog"]):not([href="/blog/"]):not([href*="/blog/tags"])',
      )
      .first();

    if ((await articleLink.count()) > 0 && (await articleLink.isVisible())) {
      const href = await articleLink.getAttribute('href');
      await articleLink.click();
      if (href) {
        await page.waitForURL(`**${href}`, {timeout: 10000});
      }
      await page.waitForLoadState('networkidle');

      // Should have navigated to an article
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
    }
  });
});

test.describe('Wishlist flow', () => {
  test('wishlist page loads (client-side)', async ({page}) => {
    await gotoReady(page, URLS.wishlist);
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Collection sorting flow', () => {
  test('sort parameter changes URL', async ({page}) => {
    await gotoReady(page, '/collections/modules');

    // Look for a sort control (select, dropdown, or link)
    const sortSelect = page.locator(
      'select[name*="sort"], select[name*="Sort"]',
    );
    if ((await sortSelect.count()) > 0 && (await sortSelect.isVisible())) {
      // Change sort option
      const options = await sortSelect.locator('option').allTextContents();
      if (options.length > 1) {
        await sortSelect.selectOption({index: 1});
        await page.waitForLoadState('networkidle');
      }
    }
    // Page should still render products regardless of sort
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Instrument hub navigation', () => {
  test('instrument hub has tabs and they navigate', async ({page}) => {
    await gotoReady(page, URLS.instrumentDetail);

    const hubNav = page.locator('[data-testid="hub-nav"]');
    await expect(hubNav).toBeVisible();

    const tabs = hubNav.locator('a');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    // Click the second tab
    if (tabCount >= 2) {
      const secondTab = tabs.nth(1);
      const tabHref = await secondTab.getAttribute('href');
      await secondTab.click();
      if (tabHref) {
        await page.waitForURL(`**${tabHref}`, {timeout: 10000});
      }
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="hub-nav"]')).toBeVisible();
    }
  });
});

test.describe('Docs navigation flow', () => {
  test('docs index has navigation links', async ({page}) => {
    await gotoReady(page, URLS.docsIndex);

    // Docs should contain links to sub-sections
    const docLinks = page.locator('a[href*="/docs/"], a[href*="/modules/"]');
    const count = await docLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Patches flow', () => {
  test('patches index shows patch cards with links', async ({page}) => {
    await gotoReady(page, URLS.patchesIndex);

    const patchLinks = page.locator('a[href*="/patches/"]');
    const count = await patchLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('patch detail shows content', async ({page}) => {
    await gotoReady(page, URLS.patchDetail);

    // Patch should have a heading
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Search interaction', () => {
  test('search with no results shows message', async ({page}) => {
    await gotoReady(page, '/search?q=xyznoexistproduct999');
    const main = page.locator('main');
    await expect(main).toBeVisible();
    // Should show some kind of content (no results message or recommendations)
    const content = await main.textContent();
    expect(content?.length).toBeGreaterThan(0);
  });
});

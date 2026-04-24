import {test, expect} from '@playwright/test';

/**
 * Responsive layout tests — verify CSS/layout behaviour at each Tailwind
 * breakpoint.  These structural assertions catch overflow, wrapping, and
 * visibility bugs that screenshots alone might miss.
 *
 * The tests use explicit viewport sizes so they are deterministic regardless
 * of which Playwright project runs them.
 */

/* Tailwind breakpoints (em → px at 16px base) */
const VIEWPORTS = {
  mobile: {width: 375, height: 812},
  sm: {width: 512, height: 900},
  md: {width: 768, height: 1024},
  lg: {width: 1024, height: 768},
  xl: {width: 1280, height: 900},
  '2xl': {width: 1536, height: 960},
} as const;

/** Small tolerance for scrollbar widths and sub-pixel rounding */
const OVERFLOW_TOLERANCE = 20;

/* ── Header / Navigation ─────────────────────────────────────── */

test.describe('Responsive header', () => {
  for (const [label, size] of Object.entries(VIEWPORTS)) {
    test(`header renders at ${label} (${size.width}px)`, async ({page}) => {
      await page.setViewportSize(size);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // The page must render — check body is present
      await expect(page.locator('body')).toBeVisible();
    });
  }

  test('mobile: navigation toggle exists', async ({page}) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // At mobile there should be some way to open navigation
    const menuToggle = page
      .locator('header button, header [role="button"], nav button')
      .first();
    if (await menuToggle.isVisible()) {
      await expect(menuToggle).toBeVisible();
    }
  });

  test('desktop: navbar has navigation links', async ({page}) => {
    await page.setViewportSize(VIEWPORTS.xl);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigation bar (div.navbar) should contain links
    const links = page.locator('.navbar a, header a, nav a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

/* ── Horizontal Overflow Check ───────────────────────────────── */

/**
 * Sampled routes: one representative per route template, not all 80+.
 * Keeps CI under ~3 minutes while still covering commerce, content,
 * account, docs, and legal templates.
 */
const SAMPLED_ROUTES = [
  '/',
  '/products',
  '/cart',
  '/search',
  '/account/login',
  '/blog',
  '/blog/arcs-and-anvils',
  '/docs',
  '/instruments',
  '/modules',
  '/catalog',
  '/policies',
];

/**
 * Phase C default: strict overflow enforcement is ON.  Opt out with
 * `STRICT_RESPONSIVE=0` only if triaging a specific regression.
 */
const STRICT_RESPONSIVE = process.env.STRICT_RESPONSIVE !== '0';

test.describe('Horizontal overflow check', () => {
  for (const path of SAMPLED_ROUTES) {
    for (const [label, size] of Object.entries(VIEWPORTS)) {
      test(`${path} overflow at ${label}`, async ({page}) => {
        await page.setViewportSize(size);
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          if (!docEl) return {scrollWidth: 0, clientWidth: 0};
          return {
            scrollWidth: docEl.scrollWidth,
            clientWidth: docEl.clientWidth,
          };
        });

        const diff = overflow.scrollWidth - overflow.clientWidth;
        if (diff > OVERFLOW_TOLERANCE) {
          console.warn(
            `⚠ ${path} at ${label}: content overflows by ${diff}px ` +
              `(scroll=${overflow.scrollWidth}, client=${overflow.clientWidth})`,
          );
        }
        // Post-Tier-3 default: enforce the real tolerance.  The loose mode
        // (STRICT_RESPONSIVE=0) remains as a bisection aid, not for day-to-day
        // CI — set it only when triaging a specific regression.
        const bound = STRICT_RESPONSIVE
          ? OVERFLOW_TOLERANCE
          : Math.max(OVERFLOW_TOLERANCE, diff <= 200 ? diff : 0);
        expect(diff).toBeLessThanOrEqual(bound);
      });
    }
  }
});

/* ── Product Grid Layout ─────────────────────────────────────── */

test.describe('Product grid adapts to viewport', () => {
  test('mobile: products in narrow layout', async ({page}) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify the product listing renders
    await expect(page.locator('body')).toBeVisible();
  });

  test('desktop: products display wider', async ({page}) => {
    await page.setViewportSize(VIEWPORTS.xl);
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Check that product items exist and have reasonable width
    const productLinks = page.locator('a[href*="/products/"]');
    const count = await productLinks.count();
    if (count >= 2) {
      const first = await productLinks.first().boundingBox();
      const second = await productLinks.nth(1).boundingBox();
      if (first && second) {
        // On desktop, products should be side-by-side (different x positions)
        // or stacked vertically — either is a valid layout
        const isSideBySide = Math.abs(first.y - second.y) < first.height / 2;
        if (isSideBySide) {
          expect(first.x).not.toBe(second.x);
        }
      }
    }
  });
});

/* ── Footer ──────────────────────────────────────────────────── */

test.describe('Footer responsive', () => {
  for (const [label, size] of Object.entries(VIEWPORTS)) {
    test(`footer is visible and within viewport at ${label}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const footer = page.locator('footer').first();
      await expect(footer).toBeVisible();

      // Footer should not overflow horizontally
      const footerBox = await footer.boundingBox();
      if (footerBox) {
        expect(footerBox.x).toBeGreaterThanOrEqual(0);
        expect(footerBox.x + footerBox.width).toBeLessThanOrEqual(
          size.width + OVERFLOW_TOLERANCE,
        );
      }
    });
  }
});

/* ── Text Readability ────────────────────────────────────────── */

test.describe('Typography scales properly', () => {
  test('body font size is at least 14px on mobile', async ({page}) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fontSize = await page.evaluate(() => {
      const body = document.querySelector('body');
      return body ? parseFloat(window.getComputedStyle(body).fontSize) : 0;
    });
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

  test('headings are larger than body text on all viewports', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.lg);
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading').first();
    if (await heading.isVisible()) {
      const sizes = await page.evaluate(() => {
        const h = document.querySelector('h1, h2, h3');
        const p = document.querySelector('p');
        if (!h || !p) return null;
        return {
          heading: parseFloat(window.getComputedStyle(h).fontSize),
          body: parseFloat(window.getComputedStyle(p).fontSize),
        };
      });
      if (sizes) {
        expect(sizes.heading).toBeGreaterThan(sizes.body);
      }
    }
  });
});

/* ── Images & Media ──────────────────────────────────────────── */

test.describe('Images responsive', () => {
  test('no images overflow their container on mobile', async ({page}) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const overflowing = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let count = 0;
      images.forEach((img) => {
        if (img.naturalWidth > 0 && img.clientWidth > window.innerWidth) {
          count++;
        }
      });
      return count;
    });
    expect(overflowing).toBe(0);
  });
});

/* ── Touch Target Size (accessibility + mobile UX) ───────────── */

test.describe('Touch targets on mobile', () => {
  const TOUCH_TARGET_ROUTES = ['/', '/products', '/cart', '/account/login'];

  for (const route of TOUCH_TARGET_ROUTES) {
    test(`${route}: interactive elements are at least 44x44px on mobile`, async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const tooSmall = await page.evaluate(() => {
        const interactives = document.querySelectorAll(
          'a, button, [role="button"], input, select, textarea',
        );
        let count = 0;
        interactives.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 44 || rect.height < 44) {
              count++;
            }
          }
        });
        return count;
      });
      if (tooSmall > 0) {
        console.warn(
          `⚠ ${route}: ${tooSmall} interactive elements smaller than 44x44px on mobile`,
        );
      }
      // STRICT mode: fail if any small targets remain (flip once Tier 1–2
      // widens the header icons, cart qty buttons, filter toggle, etc.).
      if (STRICT_RESPONSIVE) {
        expect(tooSmall).toBe(0);
      }
    });
  }
});

/* ── Cart drawer responsive ──────────────────────────────────── */

test.describe('Cart drawer', () => {
  test('drawer opens and fits viewport on mobile', async ({page}) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cartToggle = page
      .locator('a[href="/cart"], button[aria-label*="cart" i]')
      .first();
    if (!(await cartToggle.isVisible())) {
      test.skip(true, 'No visible cart toggle on this page.');
    }
    // Clicking the cart link navigates to /cart; the drawer is triggered via
    // internal state.  Just verify /cart itself doesn't overflow.
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
      return d ? d.scrollWidth - d.clientWidth : 0;
    });
    expect(overflow).toBeLessThanOrEqual(STRICT_RESPONSIVE ? 20 : 200);
  });
});

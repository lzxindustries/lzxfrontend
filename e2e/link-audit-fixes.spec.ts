import {test, expect} from '@playwright/test';

// ---------------------------------------------------------------------------
// Regression coverage for the April 2026 live link audit. Each test maps
// back to a specific fix in the plan at
// .cursor/plans/fix_link_audit_issues_33eaa5cc.plan.md so future breakage
// surfaces quickly.
// ---------------------------------------------------------------------------

test.describe('Link audit regressions', () => {
  test('docs splat with trailing slash redirects to slashless URL', async ({
    page,
  }) => {
    const response = await page.goto('/docs/guides/about-lzx/', {
      waitUntil: 'domcontentloaded',
    });
    // Redirect should land on a 200 with the slash stripped.
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe('/docs/guides/about-lzx');
  });

  test('instrument manual splat with trailing slash redirects to slashless URL', async ({
    page,
  }) => {
    const response = await page.goto(
      '/instruments/videomancer/manual/user-manual/',
      {waitUntil: 'domcontentloaded'},
    );
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe(
      '/instruments/videomancer/manual/user-manual',
    );
  });

  test('/modules/module-list redirects to /modules/specs', async ({page}) => {
    const response = await page.goto('/modules/module-list', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe('/modules/specs');
  });

  test('/collections/systems redirects to /systems', async ({page}) => {
    const response = await page.goto('/collections/systems', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe('/systems');
  });

  test('brand logo URL returns 200', async ({request}) => {
    const response = await request.get('/docs/img/logo.svg');
    expect(response.status()).toBe(200);
  });

  test('previously-500 module hubs render without errors', async ({page}) => {
    for (const slug of ['pot', 'cyclops', 'liquid-tv']) {
      const response = await page.goto(`/modules/${slug}`, {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.status(), `/modules/${slug}`).toBeLessThan(500);
    }
  });

  // -------------------------------------------------------------------------
  // April 2026 re-crawl follow-up. Each of the below maps back to a fix in
  // .cursor/plans/recrawl-fixes_0f8b5efc.plan.md.
  // -------------------------------------------------------------------------

  test('previously-500 product pages now resolve to real pages', async ({
    page,
  }) => {
    // All three of these were 500ing before the fix; now they each land
    // on a real, purchasable product (two via explicit 301, one via
    // Shopify's storefrontRedirect for the old accessory handle).
    const cases: Array<[string, string]> = [
      ['/products/2-1mm-dc-jumper-cable', '/products/dc-power-cable'],
      [
        '/products/andor-1-media-player-deluxe-accessories-pack',
        '/instruments/andor-1-media-player',
      ],
      ['/products/double-vision-84', '/products/double-vision-complete'],
    ];
    for (const [from, to] of cases) {
      const response = await page.goto(from, {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.status(), from).toBe(200);
      expect(new URL(page.url()).pathname, from).toBe(to);
    }
  });

  test('organization JSON-LD links to the correct X (Twitter) profile', async ({
    request,
  }) => {
    // The JSON-LD `sameAs` list used to reference `x.com/laboratlzx`, a
    // typo for `lzxindustries`. That single typo caused the crawler to
    // report a 403 on every page of the site.
    const response = await request.get('/');
    const html = await response.text();
    expect(html).not.toContain('x.com/laboratlzx');
    expect(html).toContain('https://x.com/lzxindustries');
  });

  test('/collections/legacy-modules redirects to /legacy', async ({page}) => {
    const response = await page.goto('/collections/legacy-modules', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe('/legacy');
  });

  test('/modules/videomancer redirects to /instruments/videomancer', async ({
    page,
  }) => {
    const response = await page.goto('/modules/videomancer', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe('/instruments/videomancer');
  });

  test('legacy Docusaurus slugs redirect into /manual/<page>', async ({
    page,
  }) => {
    const cases: Array<[string, string]> = [
      [
        '/instruments/videomancer/user-manual',
        '/instruments/videomancer/manual/user-manual',
      ],
      [
        '/instruments/videomancer/quick-start',
        '/instruments/videomancer/manual/quick-start',
      ],
      [
        '/instruments/videomancer/modulation-operators',
        '/instruments/videomancer/manual/modulation-operators',
      ],
      [
        '/instruments/videomancer/historic-device-references',
        '/instruments/videomancer/manual/historic-device-references',
      ],
    ];

    for (const [from, to] of cases) {
      const response = await page.goto(from, {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.status(), from).toBeLessThan(400);
      expect(new URL(page.url()).pathname, from).toBe(to);
    }
  });

  test('historic device references page (no longer draft) returns 200', async ({
    request,
  }) => {
    const response = await request.get(
      '/instruments/videomancer/manual/historic-device-references',
    );
    expect(response.status()).toBe(200);
  });

  test('instrument Learn card for setup links to /instruments/<slug>/setup (not /learn/setup)', async ({
    page,
  }) => {
    await page.goto('/instruments/chromagnon/learn', {
      waitUntil: 'domcontentloaded',
    });
    const setupHref = await page
      .locator('a', {hasText: /setup/i})
      .first()
      .getAttribute('href');
    expect(setupHref).toBe('/instruments/chromagnon/setup');
    expect(setupHref).not.toContain('/learn/setup');
  });

  test('chromagnon overview does not link to /manual/quick-start', async ({
    page,
  }) => {
    await page.goto('/instruments/chromagnon', {waitUntil: 'domcontentloaded'});
    const quickStartLinks = await page
      .locator('a[href$="/manual/quick-start"]')
      .count();
    expect(quickStartLinks).toBe(0);
  });
});

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
});

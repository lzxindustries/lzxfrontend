import {describe, expect, it} from 'vitest';

import {rewriteLegacyDocsLinks} from '~/lib/legacy-docs-links';

describe('rewriteLegacyDocsLinks', () => {
  it('is a no-op for HTML without legacy links', () => {
    const html = '<p>No legacy docs here, just <a href="/about">about</a>.</p>';
    expect(rewriteLegacyDocsLinks(html)).toBe(html);
  });

  it('rewrites /docs/category/program-guides on docs subdomain', () => {
    const out = rewriteLegacyDocsLinks(
      'See <a href="https://docs.lzxindustries.net/docs/category/program-guides">programs</a>.',
    );
    expect(out).toContain('/instruments/videomancer/manual/programs');
    expect(out).not.toContain('docs.lzxindustries.net');
  });

  it('rewrites /docs/docs/category/program-guides on main domain', () => {
    const out = rewriteLegacyDocsLinks(
      '<a href="https://lzxindustries.net/docs/docs/category/program-guides">programs</a>',
    );
    expect(out).toContain('/instruments/videomancer/manual/programs');
    expect(out).not.toContain('/docs/docs/');
  });

  it('injects /manual after the slug for absolute instrument URLs (slug only)', () => {
    const out = rewriteLegacyDocsLinks(
      '<a href="https://lzxindustries.net/docs/docs/instruments/videomancer">Videomancer</a>',
    );
    expect(out).toContain('/instruments/videomancer/manual');
    expect(out).not.toContain('/docs/docs/');
  });

  it('injects /manual between slug and subpath for absolute instrument URLs', () => {
    const out = rewriteLegacyDocsLinks(
      'See <a href="https://lzxindustries.net/docs/docs/instruments/videomancer/quick-start">Quick Start</a>.',
    );
    expect(out).toContain('/instruments/videomancer/manual/quick-start');
    expect(out).not.toContain('/quick-start/manual');
    expect(out).not.toContain('/docs/docs/');
  });

  it('injects /manual between slug and subpath for absolute module URLs', () => {
    const out = rewriteLegacyDocsLinks(
      '<a href="https://lzxindustries.net/docs/docs/modules/cadet-v/patch-ideas">cadet</a>',
    );
    expect(out).toContain('/modules/cadet-v/manual/patch-ideas');
    expect(out).not.toContain('/patch-ideas/manual');
  });

  it('rewrites docs.lzxindustries.net instrument URLs with subpath', () => {
    const out = rewriteLegacyDocsLinks(
      '<a href="https://docs.lzxindustries.net/docs/instruments/videomancer/modulation-operators">MO</a>',
    );
    expect(out).toContain(
      '/instruments/videomancer/manual/modulation-operators',
    );
    expect(out).not.toContain('docs.lzxindustries.net');
  });

  it('rewrites docs.lzxindustries.net module URLs with subpath', () => {
    const out = rewriteLegacyDocsLinks(
      '<a href="https://docs.lzxindustries.net/docs/modules/esg3/specs">esg3</a>',
    );
    expect(out).toContain('/modules/esg3/manual/specs');
  });

  it('fixes swapped href="/docs/docs/instruments/<slug>/<sub>" forms', () => {
    const out = rewriteLegacyDocsLinks(
      '<a href="/docs/docs/instruments/videomancer/quick-start">quick start</a>',
    );
    expect(out).toContain('href="/instruments/videomancer/manual/quick-start"');
    expect(out).not.toContain('/quick-start/manual');
  });

  it('fixes swapped href="/docs/docs/modules/<slug>/<sub>" forms', () => {
    const out = rewriteLegacyDocsLinks(
      "<a href='/docs/docs/modules/cadet-v/patch-ideas'>cadet</a>",
    );
    expect(out).toContain("href='/modules/cadet-v/manual/patch-ideas'");
    expect(out).not.toContain('/patch-ideas/manual');
  });

  it('handles href="/docs/docs/instruments/<slug>" with no subpath', () => {
    const out = rewriteLegacyDocsLinks(
      '<a href="/docs/docs/instruments/videomancer">Videomancer</a>',
    );
    expect(out).toContain('href="/instruments/videomancer/manual"');
  });

  it('rewrites legacy github documentation schematic PDFs to local /docs/pdf paths', () => {
    const html =
      '<a href="https://github.com/lzxindustries/documentation/raw/master/Castle%20111%20D%20Flip%20Flops/Castle%20111%20D%20Flip%20Flops%20Schematics.pdf">Schematics</a>';
    const out = rewriteLegacyDocsLinks(html);
    expect(out).toContain(
      '/docs/pdf/castle-111-d-flip-flops/castle-111-d-flip-flops-schematics.pdf',
    );
    expect(out).not.toContain('github.com/lzxindustries/documentation');
  });

  it('rewrites legacy github schematic PDFs regardless of branch name', () => {
    const html =
      '<a href="http://github.com/lzxindustries/documentation/raw/main/Castle%20000%20ADC/Castle%20000%20ADC%20Schematics.pdf">Schematic</a>';
    const out = rewriteLegacyDocsLinks(html);
    expect(out).toContain(
      '/docs/pdf/castle-000-adc/castle-000-adc-schematics.pdf',
    );
  });

  it('rewrites a mix of all supported forms in one HTML blob', () => {
    const html = [
      '<a href="https://docs.lzxindustries.net/docs/category/program-guides">Programs</a>',
      '<a href="https://lzxindustries.net/docs/docs/instruments/videomancer/quick-start">QS</a>',
      '<a href="/docs/docs/modules/cadet-v/patch-ideas">Patches</a>',
      '<a href="/docs/category/legacy">Legacy category</a>',
      '<a href="/docs/docs/other-page">Other</a>',
    ].join(' ');

    const out = rewriteLegacyDocsLinks(html);
    expect(out).toContain('/instruments/videomancer/manual/programs');
    expect(out).toContain('/instruments/videomancer/manual/quick-start');
    expect(out).toContain('href="/modules/cadet-v/manual/patch-ideas"');
    expect(out).toContain('href="/docs"');
    expect(out).toContain('href="/docs/other-page"');
    expect(out).not.toContain('/docs/docs/');
    expect(out).not.toContain('docs.lzxindustries.net');
  });
});

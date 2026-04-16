import {describe, expect, it} from 'vitest';
import {renderMarkdown} from '~/lib/markdown.server';

describe('renderMarkdown internal link rewriting', () => {
  it('rewrites relative .md docs links with anchors', async () => {
    const raw = 'See [Common Glossary](../common_reference.md#common-glossary).';

    const result = await renderMarkdown(
      raw,
      '/docs/img/instruments',
      '/docs/instruments/videomancer/programs/intermod',
    );

    expect(result.html).toContain(
      'href="/docs/instruments/videomancer/common_reference#common-glossary"',
    );
  });

  it('rewrites absolute /docs/*.md and /img/* links', async () => {
    const raw =
      'See [DSG3](/docs/modules/dsg3.md) and [diagram](/img/instruments/videomancer/modulation/signal_path.png).';

    const result = await renderMarkdown(raw, '/docs/img/modules', '/docs/modules/dsg3');

    expect(result.html).toContain('href="/docs/modules/dsg3"');
    expect(result.html).toContain(
      'href="/docs/img/instruments/videomancer/modulation/signal_path.png"',
    );
  });

  it('rewrites relative asset links using image base path', async () => {
    const raw = 'Download [PDF](./guide.pdf).';

    const result = await renderMarkdown(
      raw,
      '/docs/blog/chromagnon-building-it-right',
      '/blog/chromagnon-building-it-right',
    );

    expect(result.html).toContain(
      'href="/docs/blog/chromagnon-building-it-right/guide.pdf"',
    );
  });

  it('keeps external links unchanged', async () => {
    const raw = 'Visit [LZX](https://lzxindustries.net).';

    const result = await renderMarkdown(raw, '/docs/img/modules', '/docs/modules/dsg3');

    expect(result.html).toContain('href="https://lzxindustries.net"');
  });
});

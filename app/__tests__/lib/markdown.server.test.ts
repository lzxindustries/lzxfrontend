import {describe, expect, it} from 'vitest';
import {renderMarkdown} from '~/lib/markdown.server';

describe('renderMarkdown internal link rewriting', () => {
  it('rewrites relative .md docs links with anchors', async () => {
    const raw =
      'See [Common Glossary](../common_reference.md#common-glossary).';

    const result = await renderMarkdown(
      raw,
      '/docs/img/instruments',
      '/docs/instruments/videomancer/programs/intermod',
    );

    expect(result.html).toContain(
      'href="/instruments/videomancer/manual/common_reference#common-glossary"',
    );
  });

  it('rewrites absolute /docs/*.md and /img/* links', async () => {
    const raw =
      'See [DSG3](/docs/modules/dsg3.md) and [diagram](/img/instruments/videomancer/modulation/signal_path.png).';

    const result = await renderMarkdown(
      raw,
      '/docs/img/modules',
      '/docs/modules/dsg3',
    );

    expect(result.html).toContain('href="/modules/dsg3/manual"');
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

    const result = await renderMarkdown(
      raw,
      '/docs/img/modules',
      '/docs/modules/dsg3',
    );

    expect(result.html).toContain('href="https://lzxindustries.net"');
  });
});

describe('renderMarkdown MDX preprocessing', () => {
  it('strips import lines and resolves JSX img src variables', async () => {
    const raw = [
      "import my_image from '/img/guides/photo.jpg';",
      '',
      '# Hello',
      '<img src={my_image} alt="Photo" />',
    ].join('\n');

    const result = await renderMarkdown(
      raw,
      '/docs/img/guides',
      '/docs/guides/test',
    );

    expect(result.html).not.toContain('import');
    expect(result.html).toContain('src="/docs/img/guides/photo.jpg"');
    expect(result.html).toContain('alt="Photo"');
  });

  it('converts ResponsiveYouTube to iframe', async () => {
    const raw = [
      'export function ResponsiveYouTube({ videoId }) {',
      '  return <div>embed</div>;',
      '}',
      '',
      '<ResponsiveYouTube videoId="abc123" />',
    ].join('\n');

    const result = await renderMarkdown(raw);

    expect(result.html).not.toContain('export function');
    expect(result.html).toContain('youtube.com/embed/abc123');
  });

  it('converts admonition blocks to styled divs', async () => {
    const raw = [':::note', 'Important info here.', ':::'].join('\n');

    const result = await renderMarkdown(raw);

    expect(result.html).toContain('admonition-note');
    expect(result.html).toContain('Important info here.');
  });

  it('parses inline markdown inside admonition blocks', async () => {
    const raw = [
      ':::tip',
      "Press the **PLAY** button and don't **_have to_** wait.",
      ':::',
    ].join('\n');

    const result = await renderMarkdown(raw);

    expect(result.html).toContain('<strong>PLAY</strong>');
    expect(result.html).toContain('<em>have to</em>');
    expect(result.html).not.toContain('**PLAY**');
    expect(result.html).not.toContain('**_have to_**');
  });
});

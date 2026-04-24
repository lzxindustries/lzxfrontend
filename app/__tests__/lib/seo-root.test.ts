import {describe, expect, it} from 'vitest';
import type {Shop} from '@shopify/hydrogen/storefront-api-types';
import {seoPayload} from '~/lib/seo.server';

const mockShop = {
  name: 'LZX',
  brand: {logo: {image: {url: 'https://example.com/logo.png'}}},
} as unknown as Shop;

describe('seoPayload.root', () => {
  it('uses site origin for Organization url and SearchAction target', () => {
    const seo = seoPayload.root({
      shop: mockShop,
      url: 'https://example.com/blog/some-post',
    });
    const org = seo.jsonLd as {
      url: string;
      potentialAction: {target: string};
    };
    expect(org.url).toBe('https://example.com');
    expect(org.potentialAction.target).toBe(
      'https://example.com/search?q={search_term}',
    );
  });
});

describe('seoPayload.home', () => {
  it('sets canonical WebPage url to the site origin', () => {
    const seo = seoPayload.home({origin: 'https://lzx.test'});
    expect(seo.url).toBe('https://lzx.test');
    const page = seo.jsonLd as {url: string};
    expect(page.url).toBe('https://lzx.test');
  });
});

describe('seoPayload.blogPost', () => {
  it('absolutizes relative hero images for OG and JSON-LD', () => {
    const seo = seoPayload.blogPost({
      title: 'Hello',
      description: 'World',
      image: '/docs/blog/foo/hero.jpg',
      publishedAt: '2026-01-01',
      author: 'Pat',
      url: 'https://example.com/blog/hello',
    });
    const media = seo.media as {url: string} | undefined;
    expect(media?.url).toBe('https://example.com/docs/blog/foo/hero.jpg');
    const article = seo.jsonLd as {image?: string};
    expect(article.image).toBe('https://example.com/docs/blog/foo/hero.jpg');
  });
});

import {describe, expect, it} from 'vitest';
import {
  missingClass,
  formatText,
  getExcerpt,
  isNewArrival,
  isDiscounted,
  getInputStyleClasses,
  statusMessage,
  isLocalPath,
  getLocaleFromRequest,
  parseMenu,
  INPUT_STYLE_CLASSES,
  DEFAULT_LOCALE,
  assertApiErrors,
  getCartId,
} from '~/lib/utils';

describe('missingClass', () => {
  it('returns true when string is undefined', () => {
    expect(missingClass(undefined, 'px')).toBe(true);
  });

  it('returns true when class prefix is missing', () => {
    expect(missingClass('text-lg font-bold', 'px')).toBe(true);
  });

  it('returns false when class prefix is present', () => {
    expect(missingClass('px-4 text-lg', 'px')).toBe(false);
  });
});

describe('formatText', () => {
  it('returns undefined for falsy input', () => {
    expect(formatText(undefined)).toBeUndefined();
    expect(formatText('')).toBeUndefined();
  });

  it('returns non-string input unchanged', () => {
    const node = {type: 'span'};
    expect(formatText(node as any)).toBe(node);
  });

  it('applies typographic formatting to strings', () => {
    const result = formatText('Hello world test');
    expect(typeof result).toBe('string');
    expect(result).toBeTruthy();
  });
});

describe('getExcerpt', () => {
  it('extracts paragraph content from HTML', () => {
    const html = '<p>Hello world</p>';
    expect(getExcerpt(html)).toBe('<p>Hello world</p>');
  });

  it('matches greedily across multiple paragraph tags', () => {
    const html = '<div><p>Hello world</p><p>Second paragraph</p></div>';
    expect(getExcerpt(html)).toContain('<p>');
  });

  it('returns raw text when no paragraph tags found', () => {
    const text = 'Plain text without tags';
    expect(getExcerpt(text)).toBe(text);
  });
});

describe('isNewArrival', () => {
  it('returns true for a recent date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isNewArrival(yesterday.toISOString())).toBe(true);
  });

  it('returns false for an old date', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 60);
    expect(isNewArrival(oldDate.toISOString())).toBe(false);
  });

  it('respects custom daysOld parameter', () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    expect(isNewArrival(date.toISOString(), 5)).toBe(false);
    expect(isNewArrival(date.toISOString(), 15)).toBe(true);
  });
});

describe('isDiscounted', () => {
  it('returns true when compareAtPrice is higher', () => {
    const price = {amount: '10.00', currencyCode: 'USD'};
    const compareAtPrice = {amount: '20.00', currencyCode: 'USD'};
    expect(isDiscounted(price as any, compareAtPrice as any)).toBe(true);
  });

  it('returns false when prices are equal', () => {
    const price = {amount: '10.00', currencyCode: 'USD'};
    const compareAtPrice = {amount: '10.00', currencyCode: 'USD'};
    expect(isDiscounted(price as any, compareAtPrice as any)).toBe(false);
  });

  it('returns false when compareAtPrice is lower', () => {
    const price = {amount: '20.00', currencyCode: 'USD'};
    const compareAtPrice = {amount: '10.00', currencyCode: 'USD'};
    expect(isDiscounted(price as any, compareAtPrice as any)).toBe(false);
  });
});

describe('getInputStyleClasses', () => {
  it('includes error border when error is provided', () => {
    const classes = getInputStyleClasses('Some error');
    expect(classes).toContain('border-red-500');
    expect(classes).not.toContain('border-primary/20');
  });

  it('includes default border when no error', () => {
    const classes = getInputStyleClasses(null);
    expect(classes).toContain('border-primary/20');
    expect(classes).not.toContain('border-red-500');
  });

  it('includes base INPUT_STYLE_CLASSES', () => {
    const classes = getInputStyleClasses();
    expect(classes).toContain(INPUT_STYLE_CLASSES);
  });
});

describe('statusMessage', () => {
  it('translates known statuses', () => {
    expect(statusMessage('FULFILLED')).toBe('Fulfilled');
    expect(statusMessage('IN_TRANSIT')).toBe('In transit');
    expect(statusMessage('DELIVERED')).toBe('Delivered');
    expect(statusMessage('CANCELED')).toBe('Canceled');
  });

  it('returns undefined for unknown status', () => {
    expect(statusMessage('UNKNOWN_STATUS')).toBeUndefined();
  });
});

describe('isLocalPath', () => {
  it('returns true for relative paths', () => {
    expect(isLocalPath('/products/test')).toBe(true);
    expect(isLocalPath('/collections')).toBe(true);
  });

  it('returns false for full URLs', () => {
    expect(isLocalPath('https://example.com/page')).toBe(false);
    expect(isLocalPath('http://evil.com')).toBe(false);
  });
});

describe('getLocaleFromRequest', () => {
  it('returns default locale for root path', () => {
    const request = new Request('https://example.com/');
    const locale = getLocaleFromRequest(request);
    expect(locale.pathPrefix).toBe('');
    expect(locale.country).toBe('US');
  });

  it('returns matching locale for known path prefix', () => {
    const request = new Request('https://example.com/en-gb/products');
    const locale = getLocaleFromRequest(request);
    expect(locale.pathPrefix).toBe('/en-gb');
    expect(locale.country).toBe('GB');
  });

  it('returns default locale for unknown path prefix', () => {
    const request = new Request('https://example.com/xx-yy/products');
    const locale = getLocaleFromRequest(request);
    expect(locale.pathPrefix).toBe('');
    expect(locale.country).toBe('US');
  });
});

describe('assertApiErrors', () => {
  it('throws when customerUserErrors exist', () => {
    const data = {
      customerUserErrors: [{message: 'Email already taken'}],
    };
    expect(() => assertApiErrors(data)).toThrow('Email already taken');
  });

  it('does not throw when no errors', () => {
    expect(() => assertApiErrors({})).not.toThrow();
    expect(() => assertApiErrors(null)).not.toThrow();
    expect(() => assertApiErrors(undefined)).not.toThrow();
  });
});

describe('getCartId', () => {
  it('extracts cart ID from cookie', () => {
    const request = new Request('https://example.com/', {
      headers: {Cookie: 'cart=abc123; other=value'},
    });
    const cartId = getCartId(request);
    expect(cartId).toBe('gid://shopify/Cart/abc123');
  });

  it('returns undefined when no cart cookie', () => {
    const request = new Request('https://example.com/', {
      headers: {Cookie: 'other=value'},
    });
    expect(getCartId(request)).toBeUndefined();
  });

  it('returns undefined when no cookies at all', () => {
    const request = new Request('https://example.com/');
    expect(getCartId(request)).toBeUndefined();
  });
});

describe('parseMenu', () => {
  it('parses internal Shopify links correctly', () => {
    const menu = {
      id: 'menu-1',
      items: [
        {
          id: 'item-1',
          title: 'Products',
          url: 'https://mystore.myshopify.com/collections/all',
          type: 'CATALOG',
          items: [],
        },
      ],
    };
    const parsed = parseMenu(menu as any);
    expect(parsed.items[0].to).toBe('/collections/all');
    expect(parsed.items[0].isExternal).toBe(false);
    expect(parsed.items[0].target).toBe('_self');
  });

  it('parses external links correctly', () => {
    const menu = {
      id: 'menu-2',
      items: [
        {
          id: 'item-2',
          title: 'Blog',
          url: 'https://external-blog.com/posts',
          type: 'HTTP',
          items: [],
        },
      ],
    };
    const parsed = parseMenu(menu as any);
    expect(parsed.items[0].to).toBe('https://external-blog.com/posts');
    expect(parsed.items[0].isExternal).toBe(true);
    expect(parsed.items[0].target).toBe('_blank');
  });

  it('handles FRONTPAGE type', () => {
    const menu = {
      id: 'menu-3',
      items: [
        {
          id: 'item-3',
          title: 'Home',
          url: 'https://mystore.myshopify.com/',
          type: 'FRONTPAGE',
          items: [],
        },
      ],
    };
    const parsed = parseMenu(menu as any);
    expect(parsed.items[0].to).toBe('/');
  });

  it('returns menu as-is when items is missing', () => {
    const menu = {id: 'bad-menu'};
    const parsed = parseMenu(menu as any);
    expect(parsed).toBe(menu);
  });

  it('internalizes docs.lzxindustries.net links', () => {
    const menu = {
      id: 'menu-docs',
      items: [
        {
          id: 'item-docs',
          title: 'Documentation',
          url: 'https://docs.lzxindustries.net/docs/modules/dsg3',
          type: 'HTTP',
          items: [],
        },
      ],
    };
    const parsed = parseMenu(menu as any);
    expect(parsed.items[0].to).toBe('/docs/modules/dsg3');
    expect(parsed.items[0].isExternal).toBe(false);
    expect(parsed.items[0].target).toBe('_self');
  });

  it('internalizes lzxindustries.net links', () => {
    const menu = {
      id: 'menu-main',
      items: [
        {
          id: 'item-main',
          title: 'Blog',
          url: 'https://lzxindustries.net/blog',
          type: 'HTTP',
          items: [],
        },
      ],
    };
    const parsed = parseMenu(menu as any);
    expect(parsed.items[0].to).toBe('/blog');
    expect(parsed.items[0].isExternal).toBe(false);
  });

  it('keeps community.lzxindustries.net as external', () => {
    const menu = {
      id: 'menu-community',
      items: [
        {
          id: 'item-community',
          title: 'Forum',
          url: 'https://community.lzxindustries.net',
          type: 'HTTP',
          items: [],
        },
      ],
    };
    const parsed = parseMenu(menu as any);
    expect(parsed.items[0].to).toBe('https://community.lzxindustries.net');
    expect(parsed.items[0].isExternal).toBe(true);
  });
});

describe('DEFAULT_LOCALE', () => {
  it('is US English', () => {
    expect(DEFAULT_LOCALE.country).toBe('US');
    expect(DEFAULT_LOCALE.language).toBe('EN');
    expect(DEFAULT_LOCALE.pathPrefix).toBe('');
  });

  it('is frozen', () => {
    expect(Object.isFrozen(DEFAULT_LOCALE)).toBe(true);
  });
});

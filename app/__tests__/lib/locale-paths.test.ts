import {describe, expect, it} from 'vitest';
import {VALID_LOCALE_PATH_SEGMENTS} from '~/lib/locale-paths';

describe('VALID_LOCALE_PATH_SEGMENTS', () => {
  it('includes storefront locale prefixes', () => {
    expect(VALID_LOCALE_PATH_SEGMENTS.has('en-de')).toBe(true);
    expect(VALID_LOCALE_PATH_SEGMENTS.has('en-ca')).toBe(true);
  });

  it('excludes arbitrary slugs that would otherwise duplicate the home page', () => {
    expect(VALID_LOCALE_PATH_SEGMENTS.has('random-marketing-page')).toBe(false);
    expect(VALID_LOCALE_PATH_SEGMENTS.has('catalog')).toBe(false);
  });
});

import {describe, expect, it} from 'vitest';
import {trimPlainExcerpt} from '~/lib/plain-excerpt';

describe('trimPlainExcerpt', () => {
  it('does not exceed max length and avoids mid-word cuts when possible', () => {
    const out = trimPlainExcerpt(
      'Tuna Cat became inspired by dirty mixer schematics to create their own mixers.',
      42,
    );
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(43);
    expect(out).not.toMatch(/inspire…$/);
  });
});

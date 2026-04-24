import {describe, it, expect} from 'vitest';
import {moduleHasSpecsTabContent} from '~/lib/module-specs-visibility';

describe('moduleHasSpecsTabContent', () => {
  it('is true with any lzxdb structured specs', () => {
    expect(
      moduleHasSpecsTabContent(
        {metafields: []},
        1,
        0,
        0,
      ),
    ).toBe(true);
  });

  it('is true with custom.specs only', () => {
    expect(
      moduleHasSpecsTabContent(
        {
          metafields: [
            {namespace: 'custom', key: 'specs', value: '<p>x</p>', type: 'string'},
          ],
        },
        0,
        0,
        0,
      ),
    ).toBe(true);
  });

  it('is false with no data', () => {
    expect(
      moduleHasSpecsTabContent({metafields: []}, 0, 0, 0),
    ).toBe(false);
  });
});

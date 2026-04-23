import {describe, expect, it} from 'vitest';

import {loader as systemsSlugLoader} from '~/routes/($lang).systems.$slug';

describe('/systems/:slug redirect resolution', () => {
  const cases: Array<[string, string]> = [
    ['double-vision', 'double-vision-system'],
    ['double-vision-168', 'double-vision-complete'],
    ['double-vision-expander', 'double-vision-expander'],
  ];

  for (const [slug, expectedHandle] of cases) {
    it(`redirects /systems/${slug} to /products/${expectedHandle}`, async () => {
      const response = (await systemsSlugLoader({
        params: {slug},
        request: new Request(`https://lzxindustries.net/systems/${slug}`),
        context: {} as never,
      } as never)) as Response;

      expect(response.status).toBe(301);
      expect(response.headers.get('Location')).toBe(
        `/products/${expectedHandle}`,
      );
    });
  }

  it('returns 404 for unknown system slugs', async () => {
    await expect(
      systemsSlugLoader({
        params: {slug: 'not-a-system'},
        request: new Request('https://lzxindustries.net/systems/not-a-system'),
        context: {} as never,
      } as never),
    ).rejects.toMatchObject({status: 404});
  });
});

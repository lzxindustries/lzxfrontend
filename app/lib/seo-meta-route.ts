import type {SeoConfig} from '@shopify/hydrogen';
import {getSeoMeta} from '@shopify/hydrogen';

/**
 * Remix runs route `meta` even when the loader throws. Use this instead of
 * `getSeoMeta(data!.seo)` so missing loader data does not crash document SSR.
 *
 * `data` is typed as `unknown` so callers can pass `MetaArgs['data']` without
 * fighting `JsonifyObject` / deferred payload assignability.
 */
export function seoMetaFromLoaderData(data: unknown) {
  const seo = (data as {seo?: SeoConfig | null} | null | undefined)?.seo;
  if (!seo) {
    return getSeoMeta();
  }
  return getSeoMeta(seo as SeoConfig);
}

import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';

import {seoPayload} from '~/lib/seo.server';
import {hasDocPagePath} from '~/lib/content.server';
import {getDocPathForSlug} from '~/data/product-slugs';
import {getProductRecord} from '~/data/product-catalog';
import {getLfsGalleryFirstImage} from '~/data/lfs-assets';
import {
  getCommerceByHandles,
  type CommerceSnippet,
} from '~/data/shopify-live.server';

import type {
  CategoryListingConfig,
  CategoryListingData,
  CategoryListingEntry,
  CategoryListingGroup,
  CategoryListingSection,
  CategorySourceEntry,
} from './types';

const DEFAULT_GRID_COLS =
  'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';

/**
 * Build a Remix loader for a category overview page from a declarative
 * `CategoryListingConfig`. See `app/data/category-configs/*` for examples.
 */
export function createCategoryListingLoader(config: CategoryListingConfig) {
  return async function categoryListingLoader({
    context,
    request,
  }: LoaderFunctionArgs) {
    const rawSections = config.getRawSections();

    // Collect every entry so we can batch downstream lookups.
    const allEntries: CategorySourceEntry[] = [];
    for (const section of rawSections) {
      for (const group of section.groups) {
        for (const entry of group.entries) allEntries.push(entry);
      }
    }

    const allHandles = Array.from(
      new Set(allEntries.map((e) => e.canonical).filter(Boolean)),
    );

    // Live commerce snippet (price + stock) is fetched once for all entries
    // when the config opts in. Categories that only show artwork+name skip
    // this round-trip entirely.
    let commerceByHandle: Map<string, CommerceSnippet> = new Map();
    if (config.includeCommerce && allHandles.length > 0) {
      commerceByHandle = await getCommerceByHandles(
        context.storefront,
        allHandles,
      );
    }

    const defaultAspect = config.defaultArtworkAspectRatio ?? '1/1';
    const defaultFit = config.defaultArtworkFit ?? 'contain';

    const sections: CategoryListingSection[] = [];
    for (const rawSection of rawSections) {
      const groups: CategoryListingGroup[] = [];
      for (const rawGroup of rawSection.groups) {
        const ctx = {sectionKey: rawSection.key, groupKey: rawGroup.key};

        // Sort raw entries (default: by name asc).
        const sorted = [...rawGroup.entries].sort(
          config.sortEntries ?? ((a, b) => a.name.localeCompare(b.name)),
        );

        const enriched: CategoryListingEntry[] = [];
        for (const raw of sorted) {
          const docPath = getDocPathForSlug(raw.canonical);
          const hasManual = docPath ? hasDocPagePath(docPath) : false;

          if (
            config.filterEntry &&
            !config.filterEntry({...raw, hasManual}, ctx)
          ) {
            continue;
          }

          const shopifyProduct = getProductRecord(raw.canonical);
          const lfsImage = getLfsGalleryFirstImage(raw.canonical);
          const commerce = commerceByHandle.get(raw.canonical) ?? null;

          const subtitle = (config.resolveSubtitle?.(raw) ?? null) || null;

          const artwork = config.resolveArtwork?.(raw, ctx) ?? null;
          // Fallback artwork: lfs-managed gallery image (served from
          // /assets/products/...). The catalog mirror image is intentionally
          // NOT used at runtime — it lives in `catalog/shopify/` and is not
          // exported to /public.
          const fallbackImage = lfsImage
            ? {
                url: lfsImage.publicPath,
                altText: shopifyProduct?.title ?? raw.name,
                width: lfsImage.width,
                height: lfsImage.height,
              }
            : null;

          const hasInternalPage = config.resolveHasInternalPage
            ? config.resolveHasInternalPage(raw)
            : !raw.externalUrl;
          const isExternal = !hasInternalPage && Boolean(raw.externalUrl);
          const href = hasInternalPage
            ? config.detailHref(raw, ctx)
            : raw.externalUrl ?? '#';

          const badge = config.resolveBadge?.(raw, ctx) ?? null;

          enriched.push({
            key: raw.canonical,
            name: raw.name,
            subtitle,
            href,
            externalUrl: raw.externalUrl ?? null,
            isExternal,
            badge,
            image: {
              localPath: artwork?.path ?? fallbackImage?.url ?? null,
              shopify: null,
              aspectRatio: artwork?.aspectRatio ?? defaultAspect,
              fit: artwork?.fit ?? defaultFit,
            },
            commerce,
          });
        }

        if (enriched.length === 0) continue;

        const archive = config.resolveGroupArchive?.(rawGroup.key) ?? null;

        groups.push({
          key: rawGroup.key,
          label: config.resolveGroupLabel?.(rawGroup.key),
          subtitle: config.resolveGroupSubtitle?.(rawGroup.key),
          entries: enriched,
          archive: archive && archive.assets.length > 0 ? archive : null,
        });
      }

      if (groups.length === 0) continue;

      sections.push({
        key: rawSection.key,
        label: config.sectionLabels?.[rawSection.key],
        groups,
      });
    }

    const seo = seoPayload.collection({
      collection: {
        id: config.key,
        title: config.seoTitle,
        handle: config.key,
        description: config.seoDescription,
        seo: {title: config.seoTitle, description: config.seoDescription},
        descriptionHtml: '',
        updatedAt: new Date().toISOString(),
        image: null,
      } as unknown as Collection,
      url: request.url,
    });

    const data: CategoryListingData = {
      pageTitle: config.pageTitle,
      pageSubtitle: config.pageSubtitle,
      rightSlot: config.rightSlot,
      cardSize: config.cardSize ?? 'sm',
      gridColsClassName: config.gridColsClassName ?? DEFAULT_GRID_COLS,
      sections,
      seo,
    };

    return json(data);
  };
}

import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';

import {seoPayload} from '~/lib/seo.server';
import {hasDocPagePath} from '~/lib/content.server';
import {getDocPathForSlug} from '~/data/product-slugs';

import {
  CATEGORY_LISTING_BY_HANDLES_QUERY,
  CATEGORY_LISTING_BY_IDS_QUERY,
  MAX_PRODUCTS_PER_QUERY,
  buildHandleFilterQuery,
} from './queries';
import type {
  CategoryListingConfig,
  CategoryListingData,
  CategoryListingEntry,
  CategoryListingGroup,
  CategoryListingProduct,
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

    // Collect every entry so we can batch the Shopify lookups.
    const allEntries: CategorySourceEntry[] = [];
    for (const section of rawSections) {
      for (const group of section.groups) {
        for (const entry of group.entries) allEntries.push(entry);
      }
    }

    const allShopifyIds = Array.from(
      new Set(
        allEntries
          .map((e) => e.shopifyGid)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const allHandles = Array.from(
      new Set(allEntries.map((e) => e.canonical).filter(Boolean)),
    );

    const productById = new Map<string, CategoryListingProduct>();
    const productByHandle = new Map<string, CategoryListingProduct>();

    // Primary fetch: by GID.
    if (allShopifyIds.length > 0) {
      try {
        const {nodes} = await context.storefront.query<{
          nodes: (CategoryListingProduct | null)[];
        }>(CATEGORY_LISTING_BY_IDS_QUERY, {
          variables: {
            ids: allShopifyIds,
            country: context.storefront.i18n.country,
            language: context.storefront.i18n.language,
          },
        });
        for (const node of nodes) {
          if (!node) continue;
          productById.set(node.id, node);
          productByHandle.set(node.handle, node);
        }
      } catch (error) {
        console.error(
          `[${config.key}] Failed to load category listing products by IDs`,
          error,
        );
      }
    }

    // Secondary fetch: by handle for entries without a stored GID.
    const handlesNeedingFetch = allHandles.filter(
      (h) => !productByHandle.has(h),
    );
    if (handlesNeedingFetch.length > 0) {
      try {
        const handleFilterQuery = buildHandleFilterQuery(handlesNeedingFetch);
        const {products} = await context.storefront.query<{
          products: {nodes: CategoryListingProduct[]};
        }>(CATEGORY_LISTING_BY_HANDLES_QUERY, {
          variables: {
            first: Math.min(handlesNeedingFetch.length, MAX_PRODUCTS_PER_QUERY),
            query: handleFilterQuery,
            country: context.storefront.i18n.country,
            language: context.storefront.i18n.language,
          },
        });
        for (const p of products.nodes) {
          productByHandle.set(p.handle, p);
          productById.set(p.id, p);
        }
      } catch (error) {
        console.error(
          `[${config.key}] Failed to load category listing products by handles`,
          error,
        );
      }
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

          const shopifyProduct =
            (raw.shopifyGid ? productById.get(raw.shopifyGid) : undefined) ??
            productByHandle.get(raw.canonical) ??
            null;

          const subtitle =
            (config.resolveSubtitle?.(raw) ?? null) || null;

          const artwork = config.resolveArtwork?.(raw, ctx) ?? null;
          const shopifyImage =
            shopifyProduct?.featuredImage ??
            shopifyProduct?.variants?.nodes?.[0]?.image ??
            null;

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
              localPath: artwork?.path ?? null,
              shopify: shopifyImage,
              aspectRatio: artwork?.aspectRatio ?? defaultAspect,
              fit: artwork?.fit ?? defaultFit,
            },
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

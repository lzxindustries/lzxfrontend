import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getPatches} from '~/data/lzxdb';
import {listProductRecords} from '~/data/product-catalog';
import {listLocalPolicies} from '~/data/policies.server';
import {getAllContentPaths} from '~/lib/content.server';
import {
  getAllModuleSlugs,
  getAllInstrumentSlugs,
  getAllSystemSlugs,
  getDocPathForSlug,
  isSystemSlug,
} from '~/data/product-slugs';

interface ProductEntry {
  url: string;
  lastMod?: string;
  changeFreq: string;
  image?: {
    url: string;
    title?: string;
    caption?: string;
  };
}

export async function loader({request}: LoaderFunctionArgs) {
  return new Response(shopSitemap({baseUrl: new URL(request.url).origin}), {
    headers: {
      'content-type': 'application/xml',
      // Cache for 24 hours
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}

function xmlEncode(string: string) {
  return string.replace(/[&<>'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

function shopSitemap({baseUrl}: {baseUrl: string}) {
  // Generic-products page (everything that's not a module/instrument/system
  // hub). Active+visible records only, deduped by handle. Module/instrument/
  // system hubs are emitted separately further down.
  const hubSlugs = new Set<string>([
    ...getAllModuleSlugs(),
    ...getAllInstrumentSlugs(),
    ...getAllSystemSlugs(),
  ]);

  const productsData: ProductEntry[] = listProductRecords({
    activeOnly: true,
    visibleOnly: true,
  })
    .filter((record) => !hubSlugs.has(record.handle))
    .map((record) => {
      const featured = record.gallery[0];
      const url = `${baseUrl}/products/${xmlEncode(record.handle)}`;
      const entry: ProductEntry = {
        url,
        changeFreq: 'weekly',
      };
      if (record.updatedAt) entry.lastMod = record.updatedAt;
      if (featured?.shopifyUrl) {
        entry.image = {url: xmlEncode(featured.shopifyUrl)};
        if (record.title) entry.image.title = xmlEncode(record.title);
        if (featured.alt) {
          entry.image.caption = xmlEncode(featured.alt);
        }
      }
      return entry;
    });

  // Local policy and content pages — replaces the previous Shopify
  // pages query. Collections are intentionally omitted from the sitemap
  // now that catalog/category pages cover product discovery.
  const pagesData = listLocalPolicies().map((policy) => ({
    url: `${baseUrl}/policies/${policy.handle}`,
    changeFreq: 'monthly',
  }));

  const staticRoutes = [
    {url: baseUrl, changeFreq: 'daily'},
    {url: `${baseUrl}/getting-started`, changeFreq: 'monthly'},
    {url: `${baseUrl}/catalog`, changeFreq: 'weekly'},
    {url: `${baseUrl}/journal`, changeFreq: 'weekly'},
    {url: `${baseUrl}/docs/guides/glossary`, changeFreq: 'monthly'},
    {url: `${baseUrl}/patches`, changeFreq: 'weekly'},
    {url: `${baseUrl}/modules`, changeFreq: 'weekly'},
    {url: `${baseUrl}/instruments`, changeFreq: 'weekly'},
    {url: `${baseUrl}/systems`, changeFreq: 'weekly'},
  ];

  // Add individual patch pages
  const patchRoutes = getPatches().map((patch) => ({
    url: `${baseUrl}/patches/${patch.slug}`,
    changeFreq: 'monthly',
  }));

  // Add module and instrument hub pages (including manual sub-pages)
  const moduleRoutes = getAllModuleSlugs().flatMap((slug) => {
    const routes = [{url: `${baseUrl}/modules/${slug}`, changeFreq: 'weekly'}];
    if (getDocPathForSlug(slug)) {
      routes.push({
        url: `${baseUrl}/modules/${slug}/manual`,
        changeFreq: 'weekly',
      });
    }
    return routes;
  });

  const systemRoutes = getAllSystemSlugs().map((slug) => ({
    url: `${baseUrl}/systems/${slug}`,
    changeFreq: 'weekly',
  }));

  const instrumentRoutes = getAllInstrumentSlugs()
    .filter((slug) => !isSystemSlug(slug))
    .flatMap((slug) => {
      const routes = [
        {url: `${baseUrl}/instruments/${slug}`, changeFreq: 'weekly'},
      ];
      if (getDocPathForSlug(slug)) {
        routes.push({
          url: `${baseUrl}/instruments/${slug}/manual`,
          changeFreq: 'weekly',
        });
      }
      return routes;
    });

  // Add docs and blog content pages (exclude module/instrument docs — now served via hub routes)
  const contentRoutes = getAllContentPaths()
    .filter(
      (p) =>
        !p.startsWith('/docs/modules/') && !p.startsWith('/docs/instruments/'),
    )
    .map((path) => ({
      url: `${baseUrl}${path}`,
      changeFreq: path.startsWith('/blog') ? 'monthly' : 'weekly',
    }));

  const urlsDatas = [
    ...staticRoutes,
    ...patchRoutes,
    ...moduleRoutes,
    ...systemRoutes,
    ...instrumentRoutes,
    ...contentRoutes,
    ...productsData,
    ...pagesData,
  ];

  return `
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    >
      ${urlsDatas.map((url) => renderUrlTag(url)).join('')}
    </urlset>`;
}

function renderUrlTag({
  url,
  lastMod,
  changeFreq,
  image,
}: {
  url: string;
  lastMod?: string;
  changeFreq?: string;
  image?: {
    url: string;
    title?: string;
    caption?: string;
  };
}) {
  return `
    <url>
      <loc>${url}</loc>
      ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ''}
      <changefreq>${changeFreq}</changefreq>
      ${
        image
          ? `
        <image:image>
          <image:loc>${image.url}</image:loc>
          <image:title>${image.title ?? ''}</image:title>
          <image:caption>${image.caption ?? ''}</image:caption>
        </image:image>`
          : ''
      }

    </url>
  `;
}

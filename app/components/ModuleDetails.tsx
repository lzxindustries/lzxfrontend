import type {
  Product,
  Media,
  ExternalVideo,
  MediaImage,
  Metafield,
} from '@shopify/hydrogen/storefront-api-types';
import {Disclosure} from '@headlessui/react';
import React, {useMemo} from 'react';
import ProductMediaGallery, {
  type MediaGalleryItem,
  MediaGalleryItemType,
} from './ProductMediaGallery';

const getLastPathSegment = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const segments = parsedUrl.pathname
      .split('/')
      .filter((segment) => segment.length > 0);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
};

const normalizeForMatch = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getKeywordRank = (value: string, keywords: string[]): number => {
  const normalized = normalizeForMatch(value);
  for (let i = 0; i < keywords.length; i += 1) {
    if (normalized.includes(keywords[i])) {
      return keywords.length - i;
    }
  }
  return 0;
};

const rewriteLegacyDocsLinks = (html: string): string => {
  let rewritten = html;

  // Product content in Shopify still contains legacy Docusaurus category URLs.
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net\/docs\/category\/program-guides/gi,
    '/instruments/videomancer/manual/programs',
  );

  // Rewrite legacy docs.lzxindustries.net instrument links to new hub paths.
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net\/docs\/instruments\/([^"'\s<]*)/gi,
    '/instruments/$1/manual',
  );

  // Rewrite legacy docs.lzxindustries.net module links to new hub paths.
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net\/docs\/modules\/([^"'\s<]*)/gi,
    '/modules/$1/manual',
  );

  // Catch-all for any remaining legacy docs links.
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net(\/docs\/[^"'\s<]*)/gi,
    '$1',
  );

  rewritten = rewritten.replace(
    /(href=["'])\/docs\/category\/[^"']+(["'])/gi,
    '$1/docs$2',
  );

  return rewritten;
};

const getGalleryMedia = (product: Product): MediaGalleryItem[] => {
  const items: MediaGalleryItem[] = [];
  const seenYoutubeIds = new Set<string>();

  product.media.nodes.forEach((item: Media, index) => {
    if (item.mediaContentType === 'IMAGE') {
      const shopifyImage = item as MediaImage;
      if (!shopifyImage.image) return;
      items.push({
        name: (item.alt ?? '').trim() || `Image ${index + 1}`,
        src: shopifyImage.image.url,
        type: MediaGalleryItemType.IMAGE,
      } as MediaGalleryItem);
    } else if (item.mediaContentType === 'EXTERNAL_VIDEO') {
      const shopifyExternalVideo = item as ExternalVideo;
      const youtubeId = getLastPathSegment(shopifyExternalVideo.embedUrl);
      if (!youtubeId) return;
      if (seenYoutubeIds.has(youtubeId)) return;
      seenYoutubeIds.add(youtubeId);
      items.push({
        name:
          (item.alt ?? '').trim() ||
          `Video ${index + 1} (${shopifyExternalVideo.host})`,
        src: shopifyExternalVideo.embedUrl,
        type: MediaGalleryItemType.VIDEO,
      } as MediaGalleryItem);
    }
  });

  // For Videomancer, enforce a deterministic hero-first sequence:
  // hero image -> priority videos -> remaining videos -> remaining images.
  if (product.handle === 'videomancer' && items.length > 1) {
    const imagePriorityKeywords = [
      'hero',
      'front panel',
      'front',
      'main',
      'beauty',
      'product',
      'angle',
    ];
    const videoPriorityKeywords = [
      'overview',
      'intro',
      'trailer',
      'demo',
      'walkthrough',
      'performance',
    ];

    const withMeta = items.map((item, originalIndex) => ({
      item,
      originalIndex,
      rank:
        item.type === MediaGalleryItemType.IMAGE
          ? getKeywordRank(`${item.name} ${item.src}`, imagePriorityKeywords)
          : getKeywordRank(`${item.name} ${item.src}`, videoPriorityKeywords),
    }));

    const images = withMeta.filter(
      (entry) => entry.item.type === MediaGalleryItemType.IMAGE,
    );
    const videos = withMeta.filter(
      (entry) => entry.item.type === MediaGalleryItemType.VIDEO,
    );

    const heroImage = [...images].sort(
      (a, b) => b.rank - a.rank || a.originalIndex - b.originalIndex,
    )[0];

    const priorityVideo = [...videos].sort(
      (a, b) => b.rank - a.rank || a.originalIndex - b.originalIndex,
    )[0];

    const remainingVideos = videos
      .filter((entry) => entry !== priorityVideo)
      .sort((a, b) => b.rank - a.rank || a.originalIndex - b.originalIndex)
      .map((entry) => entry.item);

    const remainingImages = images
      .filter((entry) => entry !== heroImage)
      .sort((a, b) => b.rank - a.rank || a.originalIndex - b.originalIndex)
      .map((entry) => entry.item);

    const ordered: MediaGalleryItem[] = [];

    if (heroImage) {
      ordered.push(heroImage.item);
    }
    if (priorityVideo) {
      ordered.push(priorityVideo.item);
    }

    ordered.push(...remainingVideos, ...remainingImages);

    if (ordered.length > 0) {
      return ordered;
    }
  }

  return items;
};

export function ModuleDetails({
  children,
  product,
}: {
  children?: React.ReactNode;
  product: Product;
}) {
  const media: MediaGalleryItem[] = useMemo(() => {
    return getGalleryMedia(product);
  }, [product]);

  const metafields = (product as any).metafields as
    | (Metafield | null)[]
    | undefined;
  const specs = metafields?.find(
    (m) => m?.namespace === 'custom' && m?.key === 'specs',
  )?.value;
  const features = metafields?.find(
    (m) => m?.namespace === 'custom' && m?.key === 'features',
  )?.value;
  const compatibility = metafields?.find(
    (m) => m?.namespace === 'custom' && m?.key === 'compatibility',
  )?.value;

  const sections: {title: string; content: string; defaultOpen?: boolean}[] =
    [];

  if (product.descriptionHtml) {
    sections.push({
      title: 'Description',
      content: rewriteLegacyDocsLinks(product.descriptionHtml),
      defaultOpen: true,
    });
  }
  if (specs) {
    sections.push({title: 'Specs', content: rewriteLegacyDocsLinks(specs)});
  }
  if (features) {
    sections.push({
      title: 'Features',
      content: rewriteLegacyDocsLinks(features),
    });
  }
  if (compatibility) {
    sections.push({
      title: 'Compatibility',
      content: rewriteLegacyDocsLinks(compatibility),
    });
  }

  return (
    <div
      key="ModuleDetails"
      className="flex flex-wrap flex-row justify-center p-0 m-0"
    >
      <ProductMediaGallery media={media}></ProductMediaGallery>
      <div className="basis-[100%] md:basis-1/2 md:h-screen hiddenScroll md:overflow-y-scroll">
        <div className="flex flex-col gap-3 px-6 pt-4 pb-4">
          <h1 className="font-sans font-bold text-3xl md:text-4xl uppercase">
            {product.title}
          </h1>
          <div>{children}</div>
        </div>
        {sections.length > 0 && (
          <div className="border-t border-primary/10 px-6">
            {sections.map((section) => (
              <Disclosure key={section.title} defaultOpen={section.defaultOpen}>
                {({open}) => (
                  <div className="border-b border-primary/10">
                    <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left">
                      <span className="text-base font-semibold uppercase tracking-wide">
                        {section.title}
                      </span>
                      <svg
                        className={`h-5 w-5 transition-transform duration-200 ${
                          open ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Disclosure.Button>
                    <Disclosure.Panel className="pb-4">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{__html: section.content}}
                      />
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

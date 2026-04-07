import type {
  Product,
  Media,
  ExternalVideo,
  MediaImage,
} from '@shopify/hydrogen/storefront-api-types';
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

const getGalleryMedia = (
  product: Product,
): MediaGalleryItem[] => {
  const items: MediaGalleryItem[] = [];
  const seenYoutubeIds = new Set<string>();

  product.media.nodes.forEach((item: Media, index) => {
    if (item.mediaContentType === 'IMAGE') {
      const shopifyImage = item as MediaImage;
      if (!shopifyImage.image) return;
      items.push({
        name:
          (item.alt ?? '').trim() ||
          `Image ${index + 1}`,
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

  return (
    <div
      key="ModuleDetails"
      className="flex flex-wrap flex-row justify-center p-0 m-0"
    >
      <ProductMediaGallery media={media}></ProductMediaGallery>
      <div className="basis-[100%] md:basis-1/2 md:h-screen hiddenScroll md:overflow-y-scroll">
        <div className="flex flex-wrap flex-row px-8">
          <div className="basis-[100%] md:basis-1/2 pb-8">
            <div className="font-sans font-bold text-3xl uppercase">
              {product.title}
            </div>
          </div>
          <div className="basis-[100%] md:basis-1/2 pb-8">{children}</div>
        </div>
        <article key="ModuleDetailsArticle" className="prose px-8">
          <p dangerouslySetInnerHTML={{__html: product.descriptionHtml}}></p>
        </article>
      </div>
    </div>
  );
}

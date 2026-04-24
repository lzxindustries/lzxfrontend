import type {
  Product,
  Media,
  ExternalVideo,
} from '@shopify/hydrogen/storefront-api-types';
import React, {useEffect, useRef, useState} from 'react';
import {cropImageByTransparency} from '~/lib/utils';

export enum MediaGalleryItemType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export interface MediaGalleryItem {
  name: string;
  src: string;
  type: MediaGalleryItemType;
}

interface ProductMediaGalleryProps {
  media: MediaGalleryItem[];
}

const croppedCache: Record<string, string> = {};

const cropImageWithCache = (src: string): Promise<string> => {
  if (croppedCache[src]) {
    return Promise.resolve(croppedCache[src]);
  }
  return cropImageByTransparency(src).then((cropped: string) => {
    croppedCache[src] = cropped;
    return cropped;
  });
};

const getYoutubeIdFromEmbed = (embedUrl: string): string | null => {
  try {
    const url = new URL(embedUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  } catch {
    return null;
  }
};

const ProductMediaGallery: React.FC<ProductMediaGalleryProps> = ({media}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = () =>
    setCurrentSlide((prev) =>
      media.length > 0 ? (prev + 1) % media.length : 0,
    );
  const prevSlide = () =>
    setCurrentSlide((prev) =>
      media.length > 0 ? (prev - 1 + media.length) % media.length : 0,
    );

  const [preCroppedImages, setPreCroppedImages] = useState<(string | null)[]>(
    [],
  );

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentSlide(0);

    let isMounted = true;
    setPreCroppedImages(Array(media.length).fill(null));

    (async function processImages() {
      const croppedImages = await Promise.all(
        media.map(async (item) => {
          if (item.type === MediaGalleryItemType.IMAGE) {
            return await cropImageWithCache(item.src);
          }
          return null;
        }),
      );

      if (isMounted) {
        setPreCroppedImages(croppedImages);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [media]);

  // Scroll active thumbnail into view
  useEffect(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;
    const activeThumb = container.children[currentSlide] as
      | HTMLElement
      | undefined;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentSlide]);

  if (media.length === 0) {
    return (
      <div className="w-full lg:w-1/2 card-image">
        <div className="flex items-center justify-center aspect-square p-6 text-sm opacity-60">
          Media unavailable for this product.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2 card-image">
      <div className="flex-row">
        <div className="flex items-center relative aspect-square p-1 lg:p-2">
          <button
            onClick={prevSlide}
            className="mb-0 p-0 text-black rounded-full bg-white any-hover:hover:bg-black any-hover:hover:text-white border border-gray-500 transition-colors duration-200 md:p-1 lg:p-1 m-0 lg:m-1"
            aria-label="Previous Slide"
            style={{
              visibility: media.length <= 1 ? 'hidden' : 'visible',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex justify-center w-full h-full p-1 lg:p-2 overflow-hidden ">
            {media[currentSlide].type === MediaGalleryItemType.IMAGE ? (
              <img
                src={preCroppedImages[currentSlide] ?? media[currentSlide].src}
                alt={media[currentSlide].name}
                className="w-full h-full object-contain"
              />
            ) : media[currentSlide].type === MediaGalleryItemType.VIDEO ? (
              <div className="w-full ">
                <div className="relative inset-y-[25%]">
                  <iframe
                    className="aspect-video w-full "
                    src={media[currentSlide].src}
                    title={media[currentSlide].name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  />
                </div>
              </div>
            ) : null}
          </div>
          <button
            onClick={nextSlide}
            className="mb-0 p-0 text-black rounded-full bg-white any-hover:hover:bg-black any-hover:hover:text-white border border-gray-500 transition-colors duration-200 md:p-1 lg:p-1 m-0 lg:m-1"
            aria-label="Next Slide"
            style={{
              visibility: media.length <= 1 ? 'hidden' : 'visible',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        {media.length > 1 && (
          <div
            ref={thumbnailContainerRef}
            className="flex gap-2 px-2 py-2 overflow-x-auto snap-x snap-mandatory hiddenScroll"
          >
            {media.map((item, index) => (
              <button
                key={`thumb-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden snap-start transition-all duration-200 ${
                  index === currentSlide
                    ? 'ring-2 ring-black ring-offset-1'
                    : 'ring-1 ring-gray-300 opacity-70 hover:opacity-100'
                }`}
                aria-label={`View ${item.name}`}
              >
                {item.type === MediaGalleryItemType.IMAGE ? (
                  <img
                    src={preCroppedImages[index] ?? item.src}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    {(() => {
                      const ytId = getYoutubeIdFromEmbed(item.src);
                      return ytId ? (
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : null;
                    })()}
                    <svg
                      className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-md"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMediaGallery;

import {Image} from '@shopify/hydrogen';
import type {
  MediaEdge,
  MediaImage,
} from '@shopify/hydrogen/storefront-api-types';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({
  media,
  className,
}: {
  media: MediaEdge['node'][];
  className?: string;
}) {
  if (!media.length) {
    return null;
  }

  return (
    <div
      className={`swimlane md:grid-flow-row hiddenScroll md:p-0 md:overflow-x-auto md:grid-cols-2 ${className}`}
    >
      {media.map((med, i) => {
        const isFirst = i === 0;
        const isFourth = i === 3;
        const isFullWidth = i % 3 === 0;

        const data = {
          ...med,
          image: {
            // @ts-ignore
            ...med.image,
            altText: med.alt || 'Product image',
          },
        } as MediaImage;

        const style = [
          isFirst ? 'bg-sine-waves' : '',
          isFullWidth ? 'md:col-span-2' : 'md:col-span-1',
          isFirst || isFourth ? '' : 'md:aspect-[5/5]',
          'aspect-square snap-center card-image bg-white dark:bg-contrast/10 w-mobileGallery md:w-full px-4 py-4',
        ].join(' ');

        return (
          <div
            className={style}
            // @ts-ignore
            key={med.id || med.image.id}
          >
            {(med as MediaImage).image && (
              <Image
                loading={i === 0 ? 'eager' : 'lazy'}
                data={data.image!}
                aspectRatio={!isFirst && !isFourth ? '5/5' : undefined}
                sizes={
                  isFirst || isFourth
                    ? '(min-width: 48em) 60vw, 90vw'
                    : '(min-width: 48em) 30vw, 90vw'
                }
                className="object-cover w-full (max-height: 32em) aspect-square fadeIn"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

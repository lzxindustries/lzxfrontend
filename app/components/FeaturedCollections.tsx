import {Image} from '@shopify/hydrogen';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import {Grid} from '~/components/Grid';
import {Link} from '~/components/Link';
import {Heading, Section} from '~/components/Text';

export function FeaturedCollections({
  collections,
  title = 'Collections',
  ...props
}: {
  collections: Collection[];
  title?: string;
  [key: string]: any;
}) {
  const haveCollections = collections && collections.length > 0;
  if (!haveCollections) return null;

  const collectionsWithImages = collections.filter((item) => item.image);
  if (collectionsWithImages.length === 0) return null;

  return (
    <Section {...props} heading={title}>
      <Grid items={collectionsWithImages.length}>
        {collectionsWithImages.map((collection) => {
          return (
            <Link key={collection.id} to={`/collections/${collection.handle}`}>
              <div className="grid gap-4">
                <div className="card-image bg-primary/5 aspect-[3/2]">
                  {collection?.image && (
                    <Image
                      alt={collection.image.altText ?? collection.title}
                      data={collection.image}
                      sizes="(max-width: 32em) 100vw, 33vw"
                      aspectRatio="3/2"
                    />
                  )}
                </div>
                <Heading size="copy">{collection.title}</Heading>
              </div>
            </Link>
          );
        })}
      </Grid>
    </Section>
  );
}

import {Image} from '@shopify/hydrogen';
import {Link} from '~/components/Link';
import {ProductAssetArchive} from '~/components/ProductAssetArchive';
import type {
  CategoryListingData,
  CategoryListingEntry,
  CategoryListingGroup,
  CategoryListingSection,
} from '~/lib/category-listing/types';

const ASPECT_CLASS = {
  '1/1': 'aspect-square',
  '16/9': 'aspect-video',
} as const;

const FIT_CLASS = {
  contain: 'object-contain p-2',
  cover: 'object-cover',
} as const;

const SIZES_BY_ASPECT: Record<string, string> = {
  '1/1': '(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw',
  '16/9': '(min-width: 768px) 33vw, 100vw',
};

function CategoryCardImage({entry}: {entry: CategoryListingEntry}) {
  const {image, name} = entry;
  const aspectClass = ASPECT_CLASS[image.aspectRatio];
  const fitClass = FIT_CLASS[image.fit];

  if (image.localPath) {
    return (
      <img
        src={image.localPath}
        alt={name}
        loading="lazy"
        className={`${aspectClass} w-full rounded bg-base-200 ${fitClass}`}
      />
    );
  }
  if (image.shopify) {
    return (
      <Image
        data={image.shopify}
        aspectRatio={image.aspectRatio}
        sizes={SIZES_BY_ASPECT[image.aspectRatio]}
        className={`rounded bg-base-200 ${fitClass}`}
      />
    );
  }
  return (
    <div
      className={`${aspectClass} rounded bg-base-200 flex items-center justify-center text-base-content/30`}
    >
      No image
    </div>
  );
}

function CategoryCard({
  entry,
  cardSize,
}: {
  entry: CategoryListingEntry;
  cardSize: 'sm' | 'md';
}) {
  const padding = cardSize === 'md' ? 'p-4 gap-3' : 'p-3 gap-2';
  const titleClass =
    cardSize === 'md' ? 'font-semibold text-lg' : 'font-semibold text-sm';
  const subtitleClass =
    cardSize === 'md'
      ? 'mt-1 text-sm text-base-content/70 line-clamp-2'
      : 'text-xs text-base-content/70 line-clamp-2 mt-0.5';

  const cardClasses = `group flex h-full flex-col ${padding} rounded-lg border border-base-300 hover:shadow-md transition`;

  const inner = (
    <>
      <CategoryCardImage entry={entry} />
      <div className="flex flex-1 flex-col">
        <div className={`${titleClass} group-hover:text-primary transition`}>
          {entry.name}
        </div>
        {entry.subtitle ? (
          <p className={subtitleClass}>{entry.subtitle}</p>
        ) : null}
        {entry.badge ? (
          <span className="badge badge-sm badge-ghost mt-1 w-fit">
            {entry.badge}
          </span>
        ) : null}
      </div>
    </>
  );

  if (entry.isExternal) {
    return (
      <a
        key={entry.key}
        href={entry.href}
        target="_blank"
        rel="noreferrer"
        className={cardClasses}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      key={entry.key}
      to={entry.href}
      prefetch="intent"
      className={cardClasses}
    >
      {inner}
    </Link>
  );
}

function CategoryGroupView({
  group,
  cardSize,
  gridColsClassName,
}: {
  group: CategoryListingGroup;
  cardSize: 'sm' | 'md';
  gridColsClassName: string;
}) {
  return (
    <section key={group.key} className="mb-12">
      {group.label ? (
        <h2 className="text-xl font-semibold mb-1 border-b border-base-300 pb-2">
          {group.label}
        </h2>
      ) : null}
      {group.subtitle ? (
        <p className="text-sm text-base-content/70 mb-4">{group.subtitle}</p>
      ) : null}
      <div className={gridColsClassName}>
        {group.entries.map((entry) => (
          <CategoryCard key={entry.key} entry={entry} cardSize={cardSize} />
        ))}
      </div>
      {group.archive ? (
        <div className="mt-8">
          <ProductAssetArchive
            assets={group.archive.assets}
            title={group.archive.title}
          />
        </div>
      ) : null}
    </section>
  );
}

function CategorySectionView({
  section,
  cardSize,
  gridColsClassName,
}: {
  section: CategoryListingSection;
  cardSize: 'sm' | 'md';
  gridColsClassName: string;
}) {
  return (
    <section className="mb-12">
      {section.label ? (
        <h2 className="text-2xl font-bold uppercase mb-6">{section.label}</h2>
      ) : null}
      {section.groups.map((group) => (
        <CategoryGroupView
          key={group.key}
          group={group}
          cardSize={cardSize}
          gridColsClassName={gridColsClassName}
        />
      ))}
    </section>
  );
}

export function CategoryListing({data}: {data: CategoryListingData}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="font-bold text-3xl md:text-4xl uppercase">
          {data.pageTitle}
        </h1>
        {data.rightSlot ? (
          <Link
            to={data.rightSlot.to}
            className="link link-primary text-sm font-semibold"
          >
            {data.rightSlot.label}
          </Link>
        ) : null}
      </div>
      {data.pageSubtitle ? (
        <p className="mb-8 max-w-3xl text-sm text-base-content/70 md:text-base">
          {data.pageSubtitle}
        </p>
      ) : null}

      {data.sections.map((section) => (
        <CategorySectionView
          key={section.key}
          section={section}
          cardSize={data.cardSize}
          gridColsClassName={data.gridColsClassName}
        />
      ))}
    </div>
  );
}

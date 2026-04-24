import type {LfsProductAsset} from '~/data/lfs-product-metadata';

type ProductAssetArchiveProps = {
  assets: LfsProductAsset[];
  title?: string;
};

export function ProductAssetArchive({
  assets,
  title = 'Product Library Archive',
}: ProductAssetArchiveProps) {
  if (assets.length === 0) return null;

  const groups = new Map<string, LfsProductAsset[]>();

  for (const asset of assets) {
    const existing = groups.get(asset.categoryLabel) ?? [];
    existing.push(asset);
    groups.set(asset.categoryLabel, existing);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-base-content/70">
          Images and published downloads are linked directly. Source assets and
          archive-only files are indexed here when they are not shipped as web
          downloads.
        </p>
      </div>

      {Array.from(groups.entries()).map(([label, groupAssets]) => (
        <section key={label} className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/60">
            {label}
          </h4>
          <div className="grid gap-3">
            {groupAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col gap-3 rounded-lg border border-base-300 p-4 md:flex-row md:items-start md:justify-between"
              >
                <div className="flex min-w-0 gap-4">
                  {asset.previewSrc ? (
                    <a
                      href={asset.href ?? asset.previewSrc}
                      className="block h-20 w-20 shrink-0 overflow-hidden rounded border border-base-300 bg-base-200"
                    >
                      <img
                        src={asset.previewSrc}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded border border-dashed border-base-300 bg-base-200 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
                      {asset.fileType}
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-base-content/70">
                      {asset.description}
                    </div>
                    <div className="text-xs text-base-content/50 break-all">
                      {asset.relativePath}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 md:pl-4">
                  <span className="badge badge-outline">{asset.fileType}</span>
                  {asset.href ? (
                    <a
                      href={asset.href}
                      download
                      className="btn btn-sm btn-outline"
                    >
                      Open file
                    </a>
                  ) : (
                    <span className="text-sm text-base-content/60">
                      Indexed only
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import {useState} from 'react';
import {FaDownload} from 'react-icons/fa';
import {
  groupDownloadAssets,
  type DownloadAssetLike,
} from '~/lib/download-assets';

type DownloadAssetListProps<T extends DownloadAssetLike> = {
  assets: T[];
  variant?: 'product' | 'directory';
};

function getAssetHref(asset: DownloadAssetLike) {
  if (asset.href) {
    return asset.href;
  }

  if (!asset.fileName) {
    return null;
  }

  return `/assets/${encodeURIComponent(asset.fileName)}`;
}

function renderAssetRow(
  asset: DownloadAssetLike,
  variant: 'product' | 'directory',
) {
  const href = getAssetHref(asset);

  if (variant === 'directory') {
    return (
      <a
        key={asset.id}
        href={href ?? undefined}
        download={href ? true : undefined}
        className="flex flex-col gap-2 rounded border border-base-300 p-3 transition hover:bg-base-200 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <div className="font-medium truncate">
            {asset.name}
            {asset.version && (
              <span className="ml-2 badge badge-sm badge-outline">
                {asset.version}
              </span>
            )}
          </div>
          {asset.description && (
            <div className="text-xs text-base-content/70 truncate">
              {asset.description}
            </div>
          )}
          <div className="text-xs text-base-content/50 truncate">
            {asset.fileName || 'File unavailable'}
            {asset.platform && (
              <span className="ml-2">&middot; {asset.platform}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {asset.fileType ? (
            <span className="badge badge-outline">{asset.fileType}</span>
          ) : null}
          <span className="btn btn-xs btn-ghost gap-1">
            <FaDownload aria-hidden="true" />
            Download
          </span>
        </div>
      </a>
    );
  }

  return (
    <div
      key={asset.id}
      className="flex flex-col gap-3 rounded-lg border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 flex-1">
        <div className="font-medium">
          {asset.name}
          {asset.version && (
            <span className="ml-2 badge badge-sm badge-outline">
              {asset.version}
            </span>
          )}
        </div>
        {asset.description && (
          <div className="text-sm text-base-content/70">
            {asset.description}
          </div>
        )}
        <div className="text-xs text-base-content/50">
          {asset.fileName || 'File unavailable'}
          {asset.platform && (
            <span className="ml-2">&middot; {asset.platform}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {asset.fileType ? (
          <span className="badge badge-outline">{asset.fileType}</span>
        ) : null}
        {href ? (
          <a
            href={href}
            download
            className="btn btn-sm btn-outline gap-2"
            aria-label={`Download ${asset.name}`}
          >
            <FaDownload aria-hidden="true" />
            <span>Download</span>
          </a>
        ) : (
          <span className="text-sm text-base-content/60">Unavailable</span>
        )}
      </div>
    </div>
  );
}

export function DownloadAssetList<T extends DownloadAssetLike>({
  assets,
  variant = 'product',
}: DownloadAssetListProps<T>) {
  const {visibleAssets, olderFirmwareAssets} = groupDownloadAssets(assets);
  const [showOlderVersions, setShowOlderVersions] = useState(false);

  return (
    <div className={variant === 'product' ? 'grid gap-4' : 'grid gap-2'}>
      {visibleAssets.map((asset) => renderAssetRow(asset, variant))}

      {olderFirmwareAssets.length > 0 ? (
        <div className="rounded-lg border border-dashed border-base-300 p-3">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setShowOlderVersions((value) => !value)}
            aria-expanded={showOlderVersions}
          >
            {showOlderVersions
              ? 'Hide older firmware versions'
              : `Show older firmware versions (${olderFirmwareAssets.length})`}
          </button>

          {showOlderVersions ? (
            <div className="mt-3 grid gap-2">
              {olderFirmwareAssets.map((asset) =>
                renderAssetRow(asset, variant),
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

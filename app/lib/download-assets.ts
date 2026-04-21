export type DownloadAssetLike = {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  fileType?: string;
  version?: string | null;
  platform?: string | null;
  href?: string;
};

type ParsedVersion = {
  numbers: number[];
  suffixType: string | null;
  suffixNumber: number | null;
  raw: string;
};

const SUFFIX_RANK: Record<string, number> = {
  alpha: 0,
  preview: 1,
  pre: 1,
  beta: 2,
  rc: 3,
  mk: 4,
  other: 2,
};

function parseVersionToken(value: string): ParsedVersion | null {
  const match = value.match(
    /\b(?:v)?(\d+\.\d+(?:\.\d+)?)(?:[-._]?([a-z]+(?:[-._]?\w+)*))?\b/i,
  );

  if (!match) {
    return null;
  }

  const numbers = match[1].split('.').map((part) => Number(part));
  const rawSuffix = match[2] ?? null;
  const suffixTypeMatch = rawSuffix?.match(/[a-z]+/i);
  const suffixNumberMatch = rawSuffix?.match(/(\d+)(?!.*\d)/);

  return {
    numbers,
    suffixType: suffixTypeMatch?.[0].toLowerCase() ?? null,
    suffixNumber: suffixNumberMatch ? Number(suffixNumberMatch[1]) : null,
    raw: match[0],
  };
}

function parseAssetVersion(asset: DownloadAssetLike): ParsedVersion | null {
  const candidates = [asset.version, asset.name, asset.fileName].filter(
    (value): value is string => Boolean(value),
  );

  for (const candidate of candidates) {
    const parsed = parseVersionToken(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function compareParsedVersions(
  left: ParsedVersion | null,
  right: ParsedVersion | null,
): number {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return -1;
  }

  if (!right) {
    return 1;
  }

  const maxLength = Math.max(left.numbers.length, right.numbers.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftNumber = left.numbers[index] ?? 0;
    const rightNumber = right.numbers[index] ?? 0;

    if (leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }
  }

  const leftRank = left.suffixType
    ? (SUFFIX_RANK[left.suffixType] ?? SUFFIX_RANK.other)
    : 5;
  const rightRank = right.suffixType
    ? (SUFFIX_RANK[right.suffixType] ?? SUFFIX_RANK.other)
    : 5;

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  const leftSuffixNumber = left.suffixNumber ?? -1;
  const rightSuffixNumber = right.suffixNumber ?? -1;

  if (leftSuffixNumber !== rightSuffixNumber) {
    return leftSuffixNumber - rightSuffixNumber;
  }

  return left.raw.localeCompare(right.raw, undefined, {numeric: true});
}

export function compareDownloadAssetVersions(
  left: DownloadAssetLike,
  right: DownloadAssetLike,
): number {
  return compareParsedVersions(parseAssetVersion(left), parseAssetVersion(right));
}

export function isFirmwareAsset(asset: DownloadAssetLike): boolean {
  const combined = [asset.name, asset.description, asset.fileName]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();

  return combined.includes('firmware');
}

export function groupDownloadAssets<T extends DownloadAssetLike>(assets: T[]) {
  const indexedAssets = assets.map((asset, index) => ({asset, index}));
  const firmwareAssets = indexedAssets.filter(({asset}) => isFirmwareAsset(asset));

  if (firmwareAssets.length <= 1) {
    return {
      visibleAssets: assets,
      olderFirmwareAssets: [] as T[],
    };
  }

  const latestFirmware = firmwareAssets.reduce((latest, current) => {
    const comparison = compareDownloadAssetVersions(current.asset, latest.asset);

    if (comparison > 0) {
      return current;
    }

    if (comparison === 0 && current.index > latest.index) {
      return current;
    }

    return latest;
  });

  const visibleAssets: T[] = [];
  let insertedLatestFirmware = false;

  for (const {asset} of indexedAssets) {
    if (!isFirmwareAsset(asset)) {
      visibleAssets.push(asset);
      continue;
    }

    if (!insertedLatestFirmware) {
      visibleAssets.push(latestFirmware.asset);
      insertedLatestFirmware = true;
    }
  }

  const olderFirmwareAssets = firmwareAssets
    .filter(({asset}) => asset.id !== latestFirmware.asset.id)
    .sort((left, right) => {
      const comparison = compareDownloadAssetVersions(right.asset, left.asset);

      if (comparison !== 0) {
        return comparison;
      }

      return right.index - left.index;
    })
    .map(({asset}) => asset);

  return {
    visibleAssets,
    olderFirmwareAssets,
  };
}
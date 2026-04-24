import {
  getLegacyProductContentBySlug,
  type LegacyProductContent,
} from '~/data/lfs-product-metadata';
import {filterDownloadRowsForPublicSite} from '~/data/download-visibility';
import type {DocPageFull} from '~/lib/content.server';
import type {ContentFrontmatter, TocHeading} from '~/lib/markdown.server';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function headingId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function pushSection(
  sections: string[],
  headings: TocHeading[],
  title: string,
  html: string,
) {
  const id = headingId(title);
  headings.push({depth: 2, id, text: title});
  sections.push(`<h2 id="${id}">${escapeHtml(title)}</h2>${html}`);
}

function publicLegacyDownloads(content: LegacyProductContent) {
  return filterDownloadRowsForPublicSite(content.downloads);
}

function publicLegacyArchiveAssets(content: LegacyProductContent) {
  return filterDownloadRowsForPublicSite(
    content.archiveAssets.filter((asset) => !asset.isDownload),
  );
}

export function hasSyntheticLegacyModuleManualContent(
  content: LegacyProductContent | null | undefined,
): boolean {
  if (!content) return false;

  return Boolean(
    content.subtitle ||
      content.descriptionHtml ||
      content.specsHtml ||
      content.galleryImages.length > 0 ||
      publicLegacyDownloads(content).length > 0 ||
      publicLegacyArchiveAssets(content).length > 0,
  );
}

export function buildSyntheticLegacyModuleManualDoc(
  slug: string,
  title: string,
  content: LegacyProductContent | null | undefined,
  externalUrl?: string | null,
): DocPageFull | null {
  if (!hasSyntheticLegacyModuleManualContent(content)) return null;

  const safeTitle = title || slug;
  const headings: TocHeading[] = [];
  const sections: string[] = [
    '<p>Archived product-library reference assembled from LZX library content for this legacy module.</p>',
  ];

  if (content) {
    const atAGlanceItems = [
      content.subtitle
        ? `<li><strong>Module:</strong> ${escapeHtml(content.subtitle)}</li>`
        : null,
      content.galleryImages.length > 0
        ? `<li><strong>Gallery images:</strong> ${content.galleryImages.length}</li>`
        : null,
      publicLegacyDownloads(content).length > 0
        ? `<li><strong>Published downloads:</strong> ${
            publicLegacyDownloads(content).length
          }</li>`
        : null,
      publicLegacyArchiveAssets(content).length > 0
        ? `<li><strong>Archive inventory:</strong> ${
            publicLegacyArchiveAssets(content).length
          } files</li>`
        : null,
    ].filter(Boolean);

    if (atAGlanceItems.length > 0) {
      pushSection(
        sections,
        headings,
        'At a Glance',
        `<ul>${atAGlanceItems.join('')}</ul>`,
      );
    }
  }

  if (content?.descriptionHtml) {
    pushSection(sections, headings, 'Overview', content.descriptionHtml);
  }

  if (content?.specsHtml) {
    pushSection(sections, headings, 'Specifications', content.specsHtml);
  }

  if (content && content.galleryImages.length > 0) {
    const galleryMarkup = content.galleryImages
      .slice(0, 6)
      .map(
        (image) =>
          `<figure><img src="${escapeHtml(image.src)}" alt="${escapeHtml(
            image.alt || safeTitle,
          )}" /><figcaption>${escapeHtml(
            image.alt || image.path,
          )}</figcaption></figure>`,
      )
      .join('');
    const remainingCount = Math.max(content.galleryImages.length - 6, 0);

    pushSection(
      sections,
      headings,
      'Gallery',
      `<p>Representative product-library imagery for ${escapeHtml(
        safeTitle,
      )}.</p><div class="legacy-gallery-grid">${galleryMarkup}</div>${
        remainingCount > 0
          ? `<p>${remainingCount} more image${
              remainingCount === 1 ? '' : 's'
            } remain in the product library archive.</p>`
          : ''
      }`,
    );
  }

  if (content && publicLegacyDownloads(content).length > 0) {
    const items = publicLegacyDownloads(content)
      .slice(0, 10)
      .map((download) => {
        const details = [download.description];
        if (download.version) details.push(`Version ${download.version}`);
        if (download.platform) details.push(download.platform);

        return `<li><a href="${escapeHtml(download.href)}">${escapeHtml(
          download.name,
        )}</a>${
          details.filter(Boolean).length
            ? ` — ${escapeHtml(details.filter(Boolean).join(' · '))}`
            : ''
        }</li>`;
      })
      .join('');
    const moreCount = Math.max(publicLegacyDownloads(content).length - 10, 0);
    const moreLine =
      moreCount > 0
        ? `<li>${moreCount} more download${
            moreCount === 1 ? '' : 's'
          } are listed on the <a href="/modules/${escapeHtml(
            slug,
          )}/downloads">downloads page</a>.</li>`
        : '';

    pushSection(
      sections,
      headings,
      'Downloads',
      `<p>Published files from the product library are available directly on-site.</p><ul>${items}${moreLine}</ul><p><a href="/modules/${escapeHtml(
        slug,
      )}/downloads">Open the full downloads and archive page</a>.</p>`,
    );
  }

  if (content) {
    const archiveAssets = publicLegacyArchiveAssets(content);
    if (archiveAssets.length > 0) {
      const indexedOnlyCount = archiveAssets.filter(
        (asset) => !asset.href,
      ).length;
      const directCount = archiveAssets.length - indexedOnlyCount;
      const sampleItems = archiveAssets
        .slice(0, 8)
        .map((asset) => {
          const href = asset.href
            ? `<a href="${escapeHtml(asset.href)}">${escapeHtml(
                asset.name,
              )}</a>`
            : escapeHtml(asset.name);
          const suffix = asset.href ? 'Open file' : 'Indexed only';

          return `<li>${href} — ${escapeHtml(
            asset.categoryLabel,
          )} · ${escapeHtml(suffix)}</li>`;
        })
        .join('');

      pushSection(
        sections,
        headings,
        'Product Library Archive',
        `<p>${archiveAssets.length} product-library asset${
          archiveAssets.length === 1 ? '' : 's'
        } are attached to this module. ${
          directCount > 0 ? `${directCount} can be opened directly.` : ''
        }${
          indexedOnlyCount > 0
            ? ` ${indexedOnlyCount} remain indexed-only source assets.`
            : ''
        }</p><ul>${sampleItems}</ul><p><a href="/modules/${escapeHtml(
          slug,
        )}/downloads">Browse the complete archive inventory</a>.</p>`,
      );
    }
  }

  if (externalUrl) {
    pushSection(
      sections,
      headings,
      'Additional References',
      `<p>External references remain available when you need the original off-site documentation or catalog entry.</p><p><a href="${escapeHtml(
        externalUrl,
      )}" rel="noreferrer">Open external reference</a></p>`,
    );
  }

  const frontmatter: ContentFrontmatter = {
    title: `${safeTitle} Reference`,
    description:
      content?.descriptionText ??
      content?.subtitle ??
      `Archived reference material for ${safeTitle}.`,
  };

  return {
    slug,
    path: `modules/${slug}/manual`,
    frontmatter,
    html: sections.join(''),
    headings,
    readingTime: Math.max(1, Math.ceil(sections.join(' ').length / 1200)),
  };
}

export function getSyntheticLegacyModuleManualDoc(
  slug: string,
  title: string,
  externalUrl?: string | null,
): DocPageFull | null {
  const content = getLegacyProductContentBySlug(slug);
  return buildSyntheticLegacyModuleManualDoc(slug, title, content, externalUrl);
}

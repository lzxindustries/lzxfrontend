/**
 * Structured changelog / release-notes component.
 * Renders release notes with basic markdown-to-HTML conversion.
 */

export interface ReleaseEntry {
  version: string;
  date: string;
  prerelease?: boolean;
  notes: string;
}

/**
 * Parse markdown release notes into simple HTML.
 * Handles: headings, bold, lists, links, code spans, paragraphs.
 */
export function renderReleaseMarkdown(md: string): string {
  return md
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Headings
      if (trimmed.startsWith('### '))
        return `<h4 class="font-semibold mt-3 mb-1">${escapeAndInline(trimmed.slice(4))}</h4>`;
      if (trimmed.startsWith('## '))
        return `<h3 class="font-bold mt-4 mb-1">${escapeAndInline(trimmed.slice(3))}</h3>`;

      // Unordered list items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* '))
        return `<li class="ml-4 list-disc">${escapeAndInline(trimmed.slice(2))}</li>`;

      return `<p>${escapeAndInline(trimmed)}</p>`;
    })
    .join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAndInline(s: string): string {
  let out = escapeHtml(s);
  // Bold
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Inline code
  out = out.replace(/`([^`]+)`/g, '<code class="bg-base-300 px-1 rounded text-xs">$1</code>');
  // Links [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="link link-primary" target="_blank" rel="noreferrer">$1</a>',
  );
  return out;
}

interface ReleaseNotesProps {
  releases: ReleaseEntry[];
  title?: string;
}

export function ReleaseNotes({releases, title}: ReleaseNotesProps) {
  if (releases.length === 0) return null;

  return (
    <section className="rounded-xl border border-base-300 p-6">
      <h3 className="text-lg font-bold mb-4">{title ?? 'Release Notes'}</h3>
      <div className="space-y-6">
        {releases.map((release) => (
          <article
            key={release.version}
            className="border-l-2 border-primary/30 pl-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{release.version}</span>
              {release.prerelease && (
                <span className="badge badge-sm badge-warning">
                  Pre-release
                </span>
              )}
              <span className="text-sm text-base-content/50">
                {new Date(release.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div
              className="prose prose-sm max-w-none text-base-content/80"
              dangerouslySetInnerHTML={{
                __html: renderReleaseMarkdown(release.notes),
              }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

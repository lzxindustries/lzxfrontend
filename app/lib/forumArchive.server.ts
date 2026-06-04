function contentType(assetPath: string): string {
  const lower = assetPath.toLowerCase();
  if (lower.endsWith('.css')) return 'text/css; charset=utf-8';
  if (lower.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (lower.endsWith('.json')) return 'application/json; charset=utf-8';
  if (lower.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.woff2')) return 'font/woff2';
  return 'text/html; charset=utf-8';
}

const DEFAULT_FORUM_CDN =
  'https://lzx-community-archive-prod.s3.us-east-1.amazonaws.com/forum';

function forumCdnBase(): string {
  const fromEnv =
    typeof process !== 'undefined' && process.env?.FORUM_ARCHIVE_PUBLIC_BASE
      ? process.env.FORUM_ARCHIVE_PUBLIC_BASE
      : '';
  return (fromEnv || DEFAULT_FORUM_CDN).replace(/\/$/, '');
}

/**
 * Serve prebuilt Discourse archive (production: S3/HTTPS; dev: local public/forum).
 */
export async function loadForumArchiveAsset(
  request: Request,
  relativePath: string,
): Promise<Response> {
  const safe = relativePath.replace(/^\/+/, '').replace(/\.\./g, '');
  const assetPath = safe || 'index.html';

  if (process.env.NODE_ENV === 'development') {
    try {
      const {readFile} = await import('node:fs/promises');
      const {join} = await import('node:path');
      const body = await readFile(
        join(process.cwd(), 'public', 'forum', assetPath),
      );
      return new Response(body, {
        headers: {
          'Content-Type': contentType(assetPath),
          'Cache-Control': 'public, max-age=60',
        },
      });
    } catch {
      // fall through to CDN
    }
  }

  const cdnUrl = `${forumCdnBase()}/${assetPath}`;
  const response = await fetch(cdnUrl);
  if (response.ok) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') ||
          contentType(assetPath),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  throw new Response('Forum archive page not found', {status: 404});
}

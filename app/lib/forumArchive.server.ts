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

/**
 * Serve prebuilt Discourse archive files from public/forum/.
 * Resource routes call this so archive HTML is not wrapped in storefront Layout.
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
      // fall through to origin fetch
    }
  }

  const url = new URL(`/forum/${assetPath}`, request.url);
  const response = await fetch(url.toString());
  if (response.ok) {
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }

  throw new Response('Forum archive page not found', {status: 404});
}

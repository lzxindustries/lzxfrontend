import {redirect} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

/**
 * `/glossary` is a thin alias for the canonical glossary that lives
 * at `/docs/guides/glossary`. The markdown glossary is the only
 * maintained source: it is substantially longer than the legacy
 * `lzxdb.GlossaryTerm` records, carries rich cross-links into module
 * and instrument docs, and is what every inline reference across the
 * content tree already points at (e.g.
 * `/docs/guides/glossary#unipolar`).
 *
 * Running two glossary surfaces fragmented maintenance and split
 * search/SEO signals. This route stays only as a permanent redirect
 * so old bookmarks and outbound links keep working.
 */
export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const target = `/docs/guides/glossary${url.search}`;
  return redirect(target, {
    status: 301,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}

export default function GlossaryRedirect() {
  // Loader always throws a redirect response; this body is never rendered.
  return null;
}

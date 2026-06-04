import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {loadForumArchiveAsset} from '~/lib/forumArchive.server';

export async function loader({request, params}: LoaderFunctionArgs) {
  const splat = params['*'] ?? '';
  let path = splat.replace(/^\/+/, '');
  if (!path || path.endsWith('/')) {
    path = `${path}index.html`;
  } else if (!path.split('/').pop()?.includes('.')) {
    path = `${path}/index.html`;
  }
  return loadForumArchiveAsset(request, path);
}

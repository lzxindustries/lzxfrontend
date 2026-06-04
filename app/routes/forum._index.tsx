import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {loadForumArchiveAsset} from '~/lib/forumArchive.server';

export async function loader({request}: LoaderFunctionArgs) {
  return loadForumArchiveAsset(request, 'index.html');
}

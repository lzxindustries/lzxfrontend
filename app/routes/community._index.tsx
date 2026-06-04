import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {loadCommunityArchiveAsset} from '~/lib/communityArchive.server';

export async function loader({request}: LoaderFunctionArgs) {
  return loadCommunityArchiveAsset(request, 'index.html');
}

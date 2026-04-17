import {useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('modules.$slug'))?.data as any;
  const title = parentData?.product?.title ?? 'Module';
  return [{title: `${title} Downloads | LZX Industries`}];
};

export default function ModuleDownloads() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  const {assets, product} = data as unknown as ModuleHubData;

  if (assets.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 text-center">
        <p className="text-base-content/60">No downloads available for {product.title}.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-6">Downloads</h2>
      <div className="grid gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-base-300"
          >
            <div className="flex-1">
              <div className="font-medium">Asset {asset.assetId}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

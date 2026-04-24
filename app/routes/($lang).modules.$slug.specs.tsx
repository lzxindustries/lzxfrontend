import {useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import type {Metafield} from '@shopify/hydrogen/storefront-api-types';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';
import type {
  LzxModuleConnector,
  LzxModuleControl,
  LzxModuleFeature,
} from '~/data/lzxdb';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('modules.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Module';
  return [{title: `${title} Specifications | LZX Industries`}];
};

export default function ModuleSpecs() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  const {product, connectors, controls, features} =
    data as unknown as ModuleHubData;

  const metafields = (product as any).metafields as
    | (Metafield | null)[]
    | undefined;
  const specsHtml = metafields?.find(
    (m) => m?.namespace === 'custom' && m?.key === 'specs',
  )?.value;

  const hasContent =
    connectors.length > 0 ||
    controls.length > 0 ||
    features.length > 0 ||
    specsHtml;

  if (!hasContent) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 text-center">
        <p className="text-base-content/60">
          No specs available for {product.title}.
        </p>
      </div>
    );
  }

  const inputs = (connectors as LzxModuleConnector[]).filter((c) => c.isInput);
  const outputs = (connectors as LzxModuleConnector[]).filter(
    (c) => c.isOutput,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 space-y-10">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold mb-2">Specifications</h2>
        <p className="text-base-content/70">
          Technical specifications for the {product.title}
          {(connectors as LzxModuleConnector[]).length > 0 &&
            `, including ${inputs.length} input${
              inputs.length !== 1 ? 's' : ''
            } and ${outputs.length} output${outputs.length !== 1 ? 's' : ''}`}
          {(controls as LzxModuleControl[]).length > 0 &&
            ` and ${
              (controls as LzxModuleControl[]).length
            } front-panel control${
              (controls as LzxModuleControl[]).length !== 1 ? 's' : ''
            }`}
          . Use these specs to understand how {product.title} fits into your
          signal chain and which modules pair well with it.
        </p>
        {(features as LzxModuleFeature[]).length > 0 && (
          <p className="text-base-content/60 text-sm mt-2">
            {product.title} provides {(features as LzxModuleFeature[]).length}{' '}
            documented feature
            {(features as LzxModuleFeature[]).length !== 1 ? 's' : ''}.
            {inputs.length > 0 &&
              outputs.length > 0 &&
              ` Patch from its ${inputs.length} input${
                inputs.length !== 1 ? 's' : ''
              } to process signals, or tap its ${outputs.length} output${
                outputs.length !== 1 ? 's' : ''
              } to feed other modules in your system.`}
          </p>
        )}
      </div>

      {/* Shopify specs metafield */}
      {specsHtml && (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{__html: specsHtml}}
        />
      )}

      {/* Features */}
      {(features as LzxModuleFeature[]).length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-4">
            Features
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {(features as LzxModuleFeature[]).map((f) => (
              <li key={f.id}>
                <span className="font-medium">{f.name}</span>
                {f.description && (
                  <span className="text-base-content/70">
                    {' '}
                    &mdash; {f.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Connectors */}
      {(inputs.length > 0 || outputs.length > 0) && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-4">
            Connectors
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {inputs.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Inputs</p>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-base-300">
                      <th className="text-left py-2 pr-4 font-medium text-base-content/60 text-xs uppercase tracking-wide">
                        Name
                      </th>
                      <th className="text-left py-2 font-medium text-base-content/60 text-xs uppercase tracking-wide w-24">
                        Ref Des
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {inputs.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 pr-4">{c.name}</td>
                        <td className="py-2 font-mono text-sm">{c.refDes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {outputs.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Outputs</p>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-base-300">
                      <th className="text-left py-2 pr-4 font-medium text-base-content/60 text-xs uppercase tracking-wide">
                        Name
                      </th>
                      <th className="text-left py-2 font-medium text-base-content/60 text-xs uppercase tracking-wide w-24">
                        Ref Des
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {outputs.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 pr-4">{c.name}</td>
                        <td className="py-2 font-mono text-sm">{c.refDes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Controls */}
      {(controls as LzxModuleControl[]).length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-4">
            Controls
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-base-300">
                <th className="text-left py-2 pr-4 font-medium text-base-content/60 text-xs uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left py-2 pr-4 font-medium text-base-content/60 text-xs uppercase tracking-wide w-24">
                  Ref Des
                </th>
                <th className="text-left py-2 font-medium text-base-content/60 text-xs uppercase tracking-wide w-16">
                  Gain
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {(controls as LzxModuleControl[]).map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4 font-mono text-sm">{c.refDes}</td>
                  <td className="py-2">{c.isGain ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

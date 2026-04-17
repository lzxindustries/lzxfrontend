import {useOutletContext} from '@remix-run/react';
import type {Metafield} from '@shopify/hydrogen/storefront-api-types';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';
import type {LzxModuleConnector, LzxModuleControl, LzxModuleFeature} from '~/data/lzxdb';

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
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-6">Specifications</h2>

      {/* Shopify specs metafield */}
      {specsHtml && (
        <div
          className="prose prose-sm max-w-none mb-8"
          dangerouslySetInnerHTML={{__html: specsHtml}}
        />
      )}

      {/* Features */}
      {(features as LzxModuleFeature[]).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Features</h3>
          <ul className="list-disc pl-5 space-y-1">
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
        </div>
      )}

      {/* Connectors */}
      {(inputs.length > 0 || outputs.length > 0) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Connectors</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {inputs.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Inputs</h4>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Ref Des</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inputs.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td className="font-mono text-xs">{c.refDes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {outputs.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Outputs</h4>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Ref Des</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outputs.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td className="font-mono text-xs">{c.refDes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      {(controls as LzxModuleControl[]).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Controls</h3>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Ref Des</th>
                  <th>Gain</th>
                </tr>
              </thead>
              <tbody>
                {(controls as LzxModuleControl[]).map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td className="font-mono text-xs">{c.refDes}</td>
                    <td>{c.isGain ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

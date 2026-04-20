import {Link, useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';
import {SUPPORT_MANIFEST} from '~/data/support-manifest';
import {
  SignalFlowDiagram,
  getSignalFlowForProduct,
} from '~/components/SignalFlowDiagram';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('instruments.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Instrument';
  return [{title: `${title} — Setup | LZX Industries`}];
};

export default function InstrumentSetup() {
  const data = useOutletContext<InstrumentLayoutLoaderData>();
  const {product, slug, hasManual} = data as unknown as InstrumentHubData;

  const supportRecord = SUPPORT_MANIFEST[slug];
  const prerequisites = supportRecord?.setupPrerequisites ?? [];
  const connectSupported = supportRecord?.connectSupported ?? false;
  const signalFlow = getSignalFlowForProduct(slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-2">
        Setting Up Your {product.title}
      </h2>
      <p className="text-base-content/70 mb-8">
        Everything you need to get started with {product.title}.
      </p>

      {/* Prerequisites */}
      {prerequisites.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">What You&apos;ll Need</h3>
          <ul className="list-disc pl-5 space-y-2 text-base-content/80">
            {prerequisites.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Signal Flow Diagram */}
      {signalFlow && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">Signal Flow</h3>
          <p className="text-sm text-base-content/70 mb-3">
            Hover over each block to see connection details.
          </p>
          <SignalFlowDiagram config={signalFlow} />
        </section>
      )}

      {/* Quick Start Steps */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-3">Quick Start</h3>
        <ol className="list-decimal pl-5 space-y-3 text-base-content/80">
          <li>
            Unbox your {product.title} and check the contents against the
            included packing list.
          </li>
          <li>
            Connect your video display to the output using an RCA cable.
          </li>
          <li>
            Power on the unit and verify you see a video signal on your
            display.
          </li>
          {connectSupported && (
            <li>
              Check for firmware updates using{' '}
              <Link to="/connect" className="link link-primary">
                LZX Connect
              </Link>
              .
            </li>
          )}
          {hasManual && (
            <li>
              Read the{' '}
              <Link
                to={`/instruments/${slug}/manual`}
                className="link link-primary"
              >
                full manual
              </Link>{' '}
              for complete details on controls and connections.
            </li>
          )}
        </ol>
      </section>

      {/* Next Steps */}
      <section className="rounded-xl border border-base-300 bg-base-200 p-6">
        <h3 className="text-lg font-bold mb-3">Next Steps</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {hasManual && (
            <Link
              to={`/instruments/${slug}/manual`}
              className="btn btn-outline btn-sm justify-start"
            >
              📖 Read the Manual
            </Link>
          )}
          {connectSupported && (
            <Link
              to="/connect"
              className="btn btn-outline btn-sm justify-start"
            >
              🔗 Update Firmware
            </Link>
          )}
          <Link
            to={`/instruments/${slug}/learn`}
            className="btn btn-outline btn-sm justify-start"
          >
            🎓 Learning Resources
          </Link>
          <Link
            to={`/instruments/${slug}/support`}
            className="btn btn-outline btn-sm justify-start"
          >
            🛟 Get Support
          </Link>
        </div>
      </section>
    </div>
  );
}

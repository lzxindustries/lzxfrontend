import {Link, useLoaderData, useOutletContext} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {Disclosure} from '@headlessui/react';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';
import {SUPPORT_MANIFEST} from '~/data/support-manifest';
import {loadSupportContent} from '~/data/support-content.server';
import {getProductForumArchive} from '~/data/forum-archive.server';
import {getCanonicalSlug, getSlugEntry} from '~/data/product-slugs';
import {ForumArchiveSupportSection} from '~/components/ForumArchiveSupportSection';
import {
  TroubleshootingFlow,
  getTroubleshootingTree,
} from '~/components/TroubleshootingFlow';

export async function loader({params}: LoaderFunctionArgs) {
  const canonical = getCanonicalSlug(params.slug ?? '') ?? params.slug ?? '';
  const slugEntry = getSlugEntry(canonical);
  const forumArchive = canonical
    ? await getProductForumArchive(canonical, slugEntry?.externalUrl)
    : {officialTopic: null, relatedTopics: []};
  const supportContent = loadSupportContent(canonical);

  return json({forumArchive, supportContent});
}

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('instruments.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Instrument';
  return [{title: `${title} — Support | LZX Industries`}];
};

export default function InstrumentSupport() {
  const data = useOutletContext<InstrumentLayoutLoaderData>();
  const {forumArchive, supportContent} = useLoaderData<typeof loader>();
  const {product, slug, hasManual, slugEntry} =
    data as unknown as InstrumentHubData;

  const supportRecord = SUPPORT_MANIFEST[slug];
  const faqItems = supportContent.faqItems ?? [];
  const connectSupported = supportRecord?.connectSupported ?? false;
  const troubleshootingTree = getTroubleshootingTree(slug);
  const hasArchivedGuide =
    forumArchive.officialTopic != null || forumArchive.relatedTopics.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-2">{product.title} Support</h2>
      <p className="text-base-content/70 mb-8">
        Get help with your {product.title}.
      </p>

      {/* Quick Links */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-3">Resources</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {(hasManual || hasArchivedGuide) && (
            <Link
              to={`/instruments/${slug}/manual`}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
            >
              <span className="font-semibold">📖 Documentation</span>
              <span className="text-sm opacity-70">
                {hasManual
                  ? 'Full manual and reference'
                  : 'Archived community guide and reference'}
              </span>
            </Link>
          )}
          {connectSupported && (
            <Link
              to="/connect"
              className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
            >
              <span className="font-semibold">🔗 LZX Connect</span>
              <span className="text-sm opacity-70">Firmware updates</span>
            </Link>
          )}
          <Link
            to="/docs/guides/troubleshooting"
            className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
          >
            <span className="font-semibold">🔧 Troubleshooting</span>
            <span className="text-sm opacity-70">Common issues and fixes</span>
          </Link>
          <a
            href={slugEntry.externalUrl ?? 'https://community.lzxindustries.net'}
            target="_blank"
            rel="noreferrer"
            className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
          >
            <span className="font-semibold">💬 Community Forum</span>
            <span className="text-sm opacity-70">
              Ask questions, share tips
            </span>
          </a>
        </div>
      </section>

      <ForumArchiveSupportSection
        archive={forumArchive}
        manualPath={`/instruments/${slug}/manual`}
      />

      {/* Guided Troubleshooting */}
      {troubleshootingTree && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">Troubleshoot an Issue</h3>
          <TroubleshootingFlow
            nodes={troubleshootingTree}
          />
        </section>
      )}

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">
            Frequently Asked Questions
          </h3>
          <div className="space-y-1">
            {faqItems.map((item, i) => (
              <Disclosure key={i}>
                {({open}) => (
                  <div className="border-b border-base-300">
                    <Disclosure.Button className="flex w-full items-center justify-between py-3 text-left">
                      <span className="text-sm font-medium">
                        {item.question}
                      </span>
                      <svg
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          open ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Disclosure.Button>
                    <Disclosure.Panel className="pb-3 text-sm text-base-content/70">
                      <div
                        dangerouslySetInnerHTML={{__html: item.answer}}
                      />
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="rounded-xl border border-base-300 bg-base-200 p-6">
        <h3 className="text-lg font-bold mb-3">Contact Us</h3>
        <p className="text-sm text-base-content/70 mb-4">
          Can&apos;t find what you need? Our team is here to help.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">
              Technical Support
            </p>
            <a
              href="mailto:support@lzxindustries.net"
              className="link link-primary text-sm"
            >
              support@lzxindustries.net
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">
              Sales
            </p>
            <a
              href="mailto:sales@lzxindustries.net"
              className="link link-primary text-sm"
            >
              sales@lzxindustries.net
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

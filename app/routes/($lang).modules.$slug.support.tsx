import {Link, useLoaderData, useOutletContext} from '@remix-run/react';
import {Disclosure} from '@headlessui/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';
import {SUPPORT_MANIFEST} from '~/data/support-manifest';
import {getProductForumArchive} from '~/data/forum-archive.server';
import {getCanonicalSlug, getSlugEntry} from '~/data/product-slugs';
import {ForumArchiveSupportSection} from '~/components/ForumArchiveSupportSection';
import {
  TroubleshootingFlow,
  GENERIC_MODULE_TROUBLESHOOTING,
} from '~/components/TroubleshootingFlow';

export async function loader({params}: LoaderFunctionArgs) {
  const canonical = getCanonicalSlug(params.slug ?? '') ?? params.slug ?? '';
  const slugEntry = getSlugEntry(canonical);
  const forumArchive = canonical
    ? await getProductForumArchive(canonical, slugEntry?.externalUrl)
    : {officialTopic: null, relatedTopics: []};

  return json({forumArchive});
}

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('modules.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Module';
  return [{title: `${title} — Support | LZX Industries`}];
};

export default function ModuleSupport() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  const {forumArchive} = useLoaderData<typeof loader>();
  const {product, slug, hasManual, slugEntry} =
    data as unknown as ModuleHubData;

  const supportRecord = SUPPORT_MANIFEST[slug];
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
          {hasManual || hasArchivedGuide ? (
            <Link
              to={`/modules/${slug}/manual`}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
            >
              <span className="font-semibold">📖 Documentation</span>
              <span className="text-sm opacity-70">
                {hasManual
                  ? 'Full manual and reference'
                  : 'Archived community guide and reference'}
              </span>
            </Link>
          ) : slugEntry.externalUrl ? (
            <a
              href={slugEntry.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
            >
              <span className="font-semibold">📖 Documentation</span>
              <span className="text-sm opacity-70">
                External manual and reference
              </span>
            </a>
          ) : null}
          <Link
            to="/docs/guides/troubleshooting"
            className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
          >
            <span className="font-semibold">🔧 Troubleshooting</span>
            <span className="text-sm opacity-70">Common issues and fixes</span>
          </Link>
          <Link
            to="/getting-started"
            className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
          >
            <span className="font-semibold">🚀 Getting Started</span>
            <span className="text-sm opacity-70">
              Module installation guide
            </span>
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
        manualPath={`/modules/${slug}/manual`}
      />

      {/* Guided Troubleshooting */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-3">Troubleshoot an Issue</h3>
        <TroubleshootingFlow nodes={GENERIC_MODULE_TROUBLESHOOTING} />
      </section>

      {/* FAQ */}
      {supportRecord?.faqItems && supportRecord.faqItems.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {supportRecord.faqItems.map((item) => (
              <Disclosure key={item.question}>
                {({open}) => (
                  <div className="rounded-lg border border-base-300">
                    <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left font-medium">
                      {item.question}
                      <span
                        className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
                      >
                        ▾
                      </span>
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pb-4 text-sm text-base-content/80">
                      <span
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

      {/* Related Products */}
      {supportRecord?.relatedProductSlugs &&
        supportRecord.relatedProductSlugs.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">Related Products</h3>
            <div className="flex flex-wrap gap-2">
              {supportRecord.relatedProductSlugs.map((relSlug) => (
                <Link
                  key={relSlug}
                  to={`/modules/${relSlug}`}
                  className="badge badge-outline badge-lg"
                >
                  {relSlug}
                </Link>
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

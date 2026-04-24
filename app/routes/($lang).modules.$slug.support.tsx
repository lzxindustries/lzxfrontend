import {Link, useLoaderData, useOutletContext} from '@remix-run/react';
import {Disclosure} from '@headlessui/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';
import {SUPPORT_MANIFEST} from '~/data/support-manifest';
import {loadSupportContent} from '~/data/support-content.server';
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
  const supportContent = loadSupportContent(canonical);

  return json({forumArchive, supportContent});
}

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('modules.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Module';
  return [{title: `${title} — Support | LZX Industries`}];
};

export default function ModuleSupport() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  const {forumArchive, supportContent} = useLoaderData<typeof loader>();
  const {
    product,
    slug,
    hasLocalDocumentation = false,
    slugEntry,
    assets = [],
    archiveAssets = [],
  } = data as unknown as Partial<ModuleHubData> &
    Pick<ModuleHubData, 'product' | 'slug' | 'slugEntry'>;

  const supportRecord = SUPPORT_MANIFEST[slug];
  const hasArchivedGuide =
    forumArchive.officialTopic != null || forumArchive.relatedTopics.length > 0;
  const hasLocalGuide = hasLocalDocumentation || hasArchivedGuide;
  const hasResourceLibrary = assets.length > 0 || archiveAssets.length > 0;

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
          {hasLocalGuide ? (
            <Link
              to={`/modules/${slug}/manual`}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
            >
              <span className="font-semibold">📖 Documentation</span>
              <span className="text-sm opacity-70">
                {hasArchivedGuide
                  ? 'Local manual, archive guide, and reference'
                  : 'Local manual and reference'}
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
            href={
              forumArchive.officialTopic?.url ??
              'https://community.lzxindustries.net'
            }
            target="_blank"
            rel="noreferrer"
            className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
          >
            <span className="font-semibold">💬 Community Forum</span>
            <span className="text-sm opacity-70">
              Ask questions, share tips
            </span>
          </a>
          {slugEntry.externalUrl ? (
            <a
              href={slugEntry.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
            >
              <span className="font-semibold">↗ External Reference</span>
              <span className="text-sm opacity-70">
                Original external catalog or documentation entry
              </span>
            </a>
          ) : null}
        </div>
      </section>

      {(hasLocalGuide || hasResourceLibrary) && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">Product Library Resources</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {hasLocalGuide ? (
              <Link
                to={`/modules/${slug}/manual`}
                className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
              >
                <span className="font-semibold">Local Reference</span>
                <span className="text-sm opacity-70">
                  On-site manual and archived reference material.
                </span>
              </Link>
            ) : null}
            {hasResourceLibrary ? (
              <Link
                to={`/modules/${slug}/downloads`}
                className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
              >
                <span className="font-semibold">Downloads & Archive</span>
                <span className="text-sm opacity-70">
                  {assets.length} download{assets.length === 1 ? '' : 's'} and{' '}
                  {archiveAssets.length} archived file
                  {archiveAssets.length === 1 ? '' : 's'} available on-site.
                </span>
              </Link>
            ) : null}
            <Link
              to={`/modules/${slug}`}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-4"
            >
              <span className="font-semibold">Overview</span>
              <span className="text-sm opacity-70">
                Return to the product hub overview and gallery.
              </span>
            </Link>
          </div>
        </section>
      )}

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
      {supportContent.faqItems && supportContent.faqItems.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {supportContent.faqItems.map((item) => (
              <Disclosure key={item.question}>
                {({open}) => (
                  <div className="rounded-lg border border-base-300">
                    <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left font-medium">
                      {item.question}
                      <span
                        className={`ml-2 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      >
                        ▾
                      </span>
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pb-4 text-sm text-base-content/80">
                      <span dangerouslySetInnerHTML={{__html: item.answer}} />
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

import {Link, useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';
import {
  DEFAULT_LEARN_CARDS,
  INSTRUMENT_LEARN_CARDS,
  getLearnCards,
  getLearnCardHref,
  hasCuratedLearnContent,
} from '~/data/instrument-learn-cards';

export {
  DEFAULT_LEARN_CARDS,
  INSTRUMENT_LEARN_CARDS,
  getLearnCards,
  getLearnCardHref,
  hasCuratedLearnContent,
};

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('instruments.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Instrument';
  return [{title: `${title} — Learn | LZX Industries`}];
};

export default function InstrumentLearn() {
  const data = useOutletContext<InstrumentLayoutLoaderData>();
  const {product, hasManual, videos, slug, docPages} =
    data as unknown as InstrumentHubData;

  const basePath = `/instruments/${slug}`;
  const cards = getLearnCards(slug);

  // Build a set of available doc sub-paths for quick lookup
  const docSubPaths = new Set(
    docPages?.map((p) => {
      // Extract the last portion of the path (e.g. "quick-start" from "instruments/videomancer/quick-start")
      const parts = p.path.split('/');
      return parts[parts.length - 1];
    }) ?? [],
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-2">Learn {product.title}</h2>
      <p className="text-base-content/70 mb-8">
        Resources to help you get the most out of your {product.title}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          // Skip manual-based links if no manual exists
          if (card.toKey && !hasManual && card.toKey !== 'videos') return null;
          // Skip videos link if none
          if (card.toKey === 'videos' && videos.length === 0) return null;
          // Skip cards that require a specific doc page
          if (card.requiresDoc && !docSubPaths.has(card.requiresDoc))
            return null;

          const href = getLearnCardHref(card, basePath);

          if (card.external) {
            return (
              <a
                key={card.title}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="card bg-base-200 hover:bg-base-300 transition-colors p-6"
              >
                <span className="text-3xl mb-3">{card.icon}</span>
                <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                <p className="text-sm opacity-70">{card.description}</p>
              </a>
            );
          }

          return (
            <Link
              key={card.title}
              to={href}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-6"
            >
              <span className="text-3xl mb-3">{card.icon}</span>
              <h3 className="text-lg font-bold mb-1">{card.title}</h3>
              <p className="text-sm opacity-70">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

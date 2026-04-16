import type {MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {PageHeader, Section} from '~/components/Text';
import {getGlossary} from '~/data/lzxdb';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_LONG} from '~/data/cache';

export async function loader() {
  const entries = getGlossary();
  const seo = seoPayload.glossary({url: '/glossary'});

  return json(
    {entries, seo},
    {
      headers: {
        'Cache-Control': CACHE_LONG,
      },
    },
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function GlossaryPage() {
  const {entries} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Video Synthesis Glossary" />
      <Section padding="x">
        <div className="mx-auto max-w-4xl space-y-8 pb-16">
          <p className="text-lg leading-relaxed">
            Key terms and concepts used in video synthesis and analog video
            processing. This glossary is growing — check back for new entries.
          </p>
          {entries.length > 0 ? (
            <dl className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.term}>
                  <dt className="text-xl font-bold">{entry.term}</dt>
                  <dd className="mt-1 leading-relaxed">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>No glossary entries yet.</p>
          )}
        </div>
      </Section>
    </>
  );
}

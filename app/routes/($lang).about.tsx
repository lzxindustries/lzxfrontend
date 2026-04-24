import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {Link} from '@remix-run/react';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {MarkdownArticle} from '~/components/MarkdownArticle';
import {CACHE_LONG} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import aboutContent from '../../content/pages/about.md?raw';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

export async function loader({request}: LoaderFunctionArgs) {
  const seo = seoPayload.page({
    page: {
      title: 'About',
      seo: {
        title: 'About',
        description:
          'Learn about LZX Industries, our approach to video synthesis instruments, and the ideas behind our product ecosystem.',
      },
    } as any,
    url: request.url,
  });

  return json({seo}, {headers: {'Cache-Control': CACHE_LONG}});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{label: 'Home', to: '/'}, {label: 'About'}]} />
      <div className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        <header className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
            LZX Industries
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Creative instruments for video synthesis
          </h1>
          <p className="mt-4 max-w-3xl text-base-content/75 md:text-lg">
            LZX Industries builds analog and digital instruments for real-time
            image processing, modular video synthesis, and performance-driven
            visual experimentation.
          </p>
        </header>

        <MarkdownArticle content={aboutContent} />

        <section className="mt-12 rounded-xl border border-base-300 p-6 md:p-8">
          <h2 className="text-2xl font-bold">Quick Links</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/getting-started" className="btn btn-primary btn-sm">
              Getting Started
            </Link>
            <Link to="/systems" className="btn btn-outline btn-sm">
              Starter Systems
            </Link>
            <Link to="/patches" className="btn btn-outline btn-sm">
              Patches
            </Link>
            <Link to="/downloads" className="btn btn-outline btn-sm">
              Downloads
            </Link>
            <Link to="/connect" className="btn btn-outline btn-sm">
              LZX Connect
            </Link>
            <Link to="/docs" className="btn btn-outline btn-sm">
              Documentation
            </Link>
            <Link to="/artists" className="btn btn-outline btn-sm">
              Artist Features
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

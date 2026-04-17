import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {getSeoMeta, type SeoConfig} from '@shopify/hydrogen';
import {Link, useLoaderData} from '@remix-run/react';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {CACHE_LONG} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

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
  return getSeoMeta(data!.seo as SeoConfig);
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
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Creative instruments for video synthesis</h1>
          <p className="mt-4 max-w-3xl text-base-content/75 md:text-lg">
            LZX Industries builds analog and digital instruments for real-time image processing,
            modular video synthesis, and performance-driven visual experimentation.
          </p>
        </header>

        <div className="grid gap-10">
          <section className="rounded-xl border border-base-300 p-6 md:p-8">
            <h2 className="text-2xl font-bold">What We Make</h2>
            <p className="mt-3 leading-relaxed text-base-content/80">
              Our tools bridge the worlds of modular synthesis, live visuals, and video signal
              processing. We design systems that let artists shape color, sync, keying, modulation,
              and motion as a playable medium rather than a post-production workflow.
            </p>
            <p className="mt-3 leading-relaxed text-base-content/80">
              The result is an ecosystem of Eurorack modules, standalone instruments, patches,
              guides, and documentation built around performable image generation.
            </p>
          </section>

          <section className="rounded-xl border border-base-300 p-6 md:p-8">
            <h2 className="text-2xl font-bold">Built in Portland</h2>
            <p className="mt-3 leading-relaxed text-base-content/80">
              LZX Industries designs and manufactures instruments in Portland, Oregon. The goal is
              straightforward: make serious tools for video artists while keeping the documentation,
              support resources, and technical depth strong enough for long-term use.
            </p>
            <p className="mt-3 leading-relaxed text-base-content/80">
              We care about stable signal paths, deep experimentation, and systems that reward users
              who want to keep learning.
            </p>
          </section>

          <section className="rounded-xl border border-base-300 p-6 md:p-8">
            <h2 className="text-2xl font-bold">How the Site Fits In</h2>
            <p className="mt-3 leading-relaxed text-base-content/80">
              The storefront is not just a catalog. It is also the support layer for the products:
              manuals, downloads, patches, glossary terms, blog updates, and now LZX Connect for a
              unified firmware workflow.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
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

          <section className="rounded-xl border border-base-300 p-6 md:p-8">
            <h2 className="text-2xl font-bold">Start Here</h2>
            <p className="mt-3 leading-relaxed text-base-content/80">
              If you are new to the ecosystem, the fastest path is to explore the getting-started
              guide, browse starter systems, and then move into patches and product manuals.
            </p>
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
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

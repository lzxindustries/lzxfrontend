import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {Link} from '@remix-run/react';
import MailchimpSubscribe from 'react-mailchimp-subscribe';
import {
  FaArrowRight,
  FaComments,
  FaDiscord,
  FaNewspaper,
  FaPaintBrush,
  FaPodcast,
  FaRss,
} from 'react-icons/fa';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {CACHE_LONG} from '~/data/cache';
import {SOCIAL_LINKS, COMMUNITY_LINKS} from '~/data/social-links';
import {seoPayload} from '~/lib/seo.server';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

export async function loader({request}: LoaderFunctionArgs) {
  const seo = seoPayload.page({
    page: {
      title: 'Community',
      seo: {
        title: 'Community',
        description:
          'Join the LZX Industries community — Discord chat, the patcher forum, social channels, blog posts, patches, and the artist program.',
      },
    } as any,
    url: request.url,
  });

  return json({seo}, {headers: {'Cache-Control': CACHE_LONG}});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

const HUB_TILES = [
  {
    title: 'Blog',
    description:
      'Release notes, firmware updates, workshop logs, and writing from the LZX team.',
    to: '/blog',
    icon: FaRss,
    cta: 'Read the blog',
  },
  {
    title: 'Patches',
    description:
      'A growing library of patches contributed by the LZX team and the community.',
    to: '/patches',
    icon: FaPaintBrush,
    cta: 'Browse patches',
  },
  {
    title: 'Artist Features',
    description:
      'Conversations with artists working in video synthesis. New features regularly.',
    to: '/artists',
    icon: FaPodcast,
    cta: 'See artists',
  },
  {
    title: 'Newsletter Archive',
    description:
      'Past issues of the LZX newsletter — release announcements and event recaps.',
    href: COMMUNITY_LINKS.newsletterArchive,
    icon: FaNewspaper,
    cta: 'Browse archive',
  },
];

export default function CommunityPage() {
  return (
    <>
      <Breadcrumbs items={[{label: 'Home', to: '/'}, {label: 'Community'}]} />

      {/* Hero — branded dark/gradient treatment so navigating from the
       * home page does not feel like landing on a different site. */}
      <section className="relative isolate overflow-hidden bg-black px-6 py-20 md:px-10 lg:px-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(80,76,159,0.45)_0%,_transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black"
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-mystic">
            LZX Community
          </p>
          <h1 className="font-display text-4xl font-black tracking-tight text-moonwax md:text-6xl">
            Patch with us.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Artists, engineers, and the LZX team trade patches, troubleshoot
            modules, and share work across Discord, the forum, and our social
            channels. Pick a doorway — they all lead to the same hallway.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={COMMUNITY_LINKS.forum}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-mystic px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-moonwax shadow-lg shadow-mystic/20 transition hover:bg-mystic-light"
            >
              <FaComments /> Visit the Forum
            </a>
            <a
              href="https://discord.gg/7xzD4XzhGn"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/10"
            >
              <FaDiscord /> Join Discord
            </a>
          </div>
        </div>
      </section>

      {/* Socials grid */}
      <section className="bg-base-100 px-6 py-16 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Follow LZX
            </p>
            <h2 className="mt-2 text-3xl font-bold">All our channels</h2>
            <p className="mt-3 text-base-content/70">
              We post in every flavor — pick the platform that fits your feed.
            </p>
          </header>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOCIAL_LINKS.map(({id, label, href, ariaLabel, icon: Icon, description}) => (
              <li key={id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={ariaLabel}
                  className="group flex h-full items-start gap-4 rounded-xl border border-base-300 bg-base-200 p-5 transition-colors hover:border-primary/60 hover:bg-base-300"
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-base-100 text-primary">
                    <Icon size={24} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      {label}
                      <FaArrowRight
                        size={12}
                        className="opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </span>
                    {description ? (
                      <span className="mt-1 block text-sm text-base-content/70">
                        {description}
                      </span>
                    ) : null}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Talk to people: forum + discord callouts */}
      <section className="bg-base-200 px-6 py-16 md:px-10 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-base-300 bg-base-100 p-7">
            <FaComments className="text-3xl text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Community Forum</h2>
            <p className="mt-2 text-base-content/70">
              Long-form threads about patching, repair, build logs, and module
              design. The best place to ask a question that needs more than a
              chat reply.
            </p>
            <a
              href={COMMUNITY_LINKS.forum}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-5"
            >
              Open the Forum
            </a>
          </article>

          <article className="rounded-2xl border border-base-300 bg-base-100 p-7">
            <FaDiscord className="text-3xl text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Discord</h2>
            <p className="mt-2 text-base-content/70">
              Real-time chat with artists, the LZX team, and other patchers.
              Voice channels for jam sessions, dedicated rooms for each
              instrument and module series.
            </p>
            <a
              href="https://discord.gg/7xzD4XzhGn"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-5"
            >
              Join the server
            </a>
          </article>
        </div>
      </section>

      {/* Hub tiles: blog, patches, artists, newsletter archive */}
      <section className="bg-base-100 px-6 py-16 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8">
            <h2 className="text-3xl font-bold">Read, watch, patch</h2>
            <p className="mt-2 text-base-content/70">
              Everything we publish, in one place.
            </p>
          </header>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HUB_TILES.map((tile) => {
              const Icon = tile.icon;
              const className =
                'group flex h-full flex-col rounded-xl border border-base-300 bg-base-200 p-5 transition-colors hover:border-primary/60 hover:bg-base-300';
              const inner = (
                <>
                  <Icon className="text-2xl text-primary" />
                  <h3 className="mt-3 text-lg font-semibold">{tile.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-base-content/70">
                    {tile.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {tile.cta}
                    <FaArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </>
              );
              return tile.href ? (
                <a
                  key={tile.title}
                  href={tile.href}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                >
                  {inner}
                </a>
              ) : (
                <Link key={tile.title} to={tile.to!} className={className}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="bg-base-200 px-6 py-16 md:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-base-300 bg-base-100 p-7 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Newsletter
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Release notes in your inbox.
          </h2>
          <p className="mt-2 text-base-content/70">
            Firmware updates, new programs, workshop announcements, and
            occasional artist features. No marketing fluff.
          </p>
          <div className="mt-5">
            {/* @ts-expect-error react-mailchimp-subscribe types incompatible with React 18 */}
            <MailchimpSubscribe url={COMMUNITY_LINKS.newsletterSignup} />
          </div>
        </div>
      </section>
    </>
  );
}

import {BeforeAfterSlider} from '~/components/BeforeAfterSlider';
import {Link} from '~/components/Link';
import {Heading, Text} from '~/components/Text';

const segments = [
  {
    id: 'live-performance',
    title: 'Live Performance',
    icon: '/icons/videomancy/segment_live_performance.svg',
    body: 'Turn camera footage into tactile broadcast-style motion graphics live.',
  },
  {
    id: 'glitch-texture',
    title: 'Glitch & Texture',
    icon: '/icons/videomancy/segment_glitch_texture.svg',
    body: 'Add hands-on glitch and color processing to HDMI sources with no laptop plugin chain.',
  },
  {
    id: 'format-bridge',
    title: 'Format Converter',
    icon: '/icons/videomancy/segment_format_bridge.svg',
    body: 'Bridge modular video, analog formats, and HDMI from one box.',
  },
  {
    id: 'audio-reactive',
    title: 'Audio-Reactive',
    icon: '/icons/videomancy/segment_audio_reactive.svg',
    body: 'Bring MIDI, CV, and audio reactivity to real video hardware in minutes.',
  },
];

const proofCards = [
  {
    title: 'Plug in and perform',
    icon: '/icons/videomancy/proof_plug.svg',
    body: 'Connect any HDMI, composite, or component video source. Load a program. Start creating. No software setup, no plugin chains, no laptop required.',
  },
  {
    title: 'An ever-expanding library of effects',
    icon: '/icons/videomancy/proof_library.svg',
    body: 'From broadcast color correction to destructive glitch, every program is a new instrument. Regular firmware updates deliver fresh creative tools for free.',
  },
  {
    title: 'Open source SDK',
    icon: '/icons/videomancy/proof_shield.svg',
    body: 'Build your own video effects with the open source Videomancer SDK. Share programs, get help, and collaborate with a welcoming community of artists and engineers on Discord and GitHub.',
  },
];

const sourcePairs = [
  {
    title: 'Pop Art Posterize',
    program: 'stipple',
    source: '/images/before-after/stipple_parrot_source.png',
    processed: '/images/before-after/stipple_parrot_processed.png',
  },
  {
    title: 'Technicolor Film',
    program: 'glorious',
    source: '/images/before-after/glorious_fruit_source.png',
    processed: '/images/before-after/glorious_fruit_processed.png',
  },
  {
    title: 'Signal Scramble',
    program: 'scramble',
    source: '/images/before-after/scramble_sunset_source.png',
    processed: '/images/before-after/scramble_sunset_processed.png',
  },
  {
    title: 'Scanimate Warp',
    program: 'elastica',
    source: '/images/before-after/elastica_woman_source.png',
    processed: '/images/before-after/elastica_woman_processed.png',
  },
  {
    title: 'Thermal False Color',
    program: 'isotherm',
    source: '/images/before-after/isotherm_runner_source.png',
    processed: '/images/before-after/isotherm_runner_processed.png',
  },
  {
    title: 'Retro Color Quantize',
    program: 'stic',
    source: '/images/before-after/stic_castle_source.png',
    processed: '/images/before-after/stic_castle_processed.png',
  },
];

const hardwareImages = [
  {src: '/images/videomancer/hardware/photo-rear.png', alt: 'Videomancer rear panel'},
  {src: '/images/videomancer/hardware/photo-angle-front.png', alt: 'Videomancer front angle'},
  {src: '/images/videomancer/hardware/photo-side.png', alt: 'Videomancer side view'},
];

const btsImages = [
  {src: '/images/videomancer/bts/box-stack.png', alt: 'Videomancer boxes stacked in the workshop'},
  {src: '/images/videomancer/bts/assembly-case.png', alt: 'Videomancer case assembly'},
  {src: '/images/videomancer/bts/pouch-dice.png', alt: 'Videomancer packaging'},
];

export function VideomancyLandingSections() {
  return (
    <>
      {/* Before / After Gallery */}
      <section className="bg-black px-6 py-20 md:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="text-center">
            <Heading
              as="h2"
              className="vm-reveal mx-auto font-display text-xl font-black uppercase tracking-[0.1em] text-moonwax md:text-3xl"
            >
              Watch closely
            </Heading>
            <Text as="p" className="vm-reveal vm-reveal-delay-1 mx-auto mt-3 max-w-xl text-white/60 md:text-lg">
              One instrument. One program between ordinary and extraordinary.
            </Text>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {sourcePairs.map((pair, index) => (
              <div
                key={pair.title}
                className="vm-reveal"
                style={{animationDelay: `${140 + index * 90}ms`}}
              >
                <BeforeAfterSlider
                  sourceUrl={pair.source}
                  processedUrl={pair.processed}
                  title={pair.title}
                  programName={pair.program}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Identity Selector — "What will you create?" */}
      <section className="bg-[#0a0a0a] px-6 py-20 md:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="text-center">
            <Heading
              as="h2"
              className="vm-reveal mx-auto font-display text-xl font-black uppercase tracking-[0.1em] text-moonwax md:text-3xl"
            >
              Pick a path, any path
            </Heading>
            <Text as="p" className="vm-reveal vm-reveal-delay-1 mx-auto mt-3 max-w-2xl text-white/60 md:text-lg">
              Every creator arrives with a different source and a different
              intention. The instrument does not care. It is ready for all of
              them.
            </Text>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {segments.map((segment, index) => (
              <Link
                key={segment.id}
                to={`/products/videomancer#${segment.id}`}
                className="vm-reveal group rounded-2xl border border-lzx-border/40 bg-lzx-card/50 p-6 transition-all duration-300 any-hover:hover:scale-[1.03] any-hover:hover:border-mystic/60 any-hover:hover:bg-lzx-card/80"
                style={{animationDelay: `${120 + index * 80}ms`}}
              >
                <div className="mb-4" aria-hidden="true">
                  <img src={segment.icon} alt="" width={56} height={56} className="h-14 w-14" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-moonwax">
                  {segment.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {segment.body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Real Hardware */}
      <section className="overflow-hidden bg-black py-16">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12">
          <Heading
            as="h2"
            className="vm-reveal mx-auto text-center font-display text-xl font-black uppercase tracking-[0.1em] text-moonwax md:text-3xl"
          >
            Real hardware
          </Heading>
          <Text as="p" className="vm-reveal vm-reveal-delay-1 mx-auto mt-3 max-w-xl text-center text-white/60 md:text-lg">
            Old school, industrial build quality. Just like broadcast video electronics from the 70s and 80s.
          </Text>
        </div>
        <div className="hiddenScroll mt-8 flex gap-3 overflow-x-auto px-6 pb-4 md:px-10 lg:justify-center lg:px-12">
          {hardwareImages.map((img, index) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={480}
              height={320}
              loading="lazy"
              className="vm-reveal h-48 w-72 flex-shrink-0 rounded-xl object-cover md:h-56 md:w-80 lg:h-64 lg:w-96"
              style={{animationDelay: `${80 + index * 70}ms`}}
            />
          ))}
        </div>
      </section>

      {/* Behind the Scenes */}
      <section className="overflow-hidden bg-[#060606] py-16">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12">
          <Heading
            as="h2"
            className="vm-reveal mx-auto text-center font-display text-xl font-black uppercase tracking-[0.1em] text-moonwax md:text-3xl"
          >
            Built by video freaks
          </Heading>
          <Text as="p" className="vm-reveal vm-reveal-delay-1 mx-auto mt-3 max-w-xl text-center text-white/60 md:text-lg">
            Assembled by hand in a basement workshop in Portland, Oregon.
          </Text>
        </div>
        <div className="hiddenScroll mt-8 flex gap-3 overflow-x-auto px-6 pb-4 md:px-10 lg:justify-center lg:px-12">
          {btsImages.map((img, index) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={480}
              height={320}
              loading="lazy"
              className="vm-reveal h-48 w-72 flex-shrink-0 rounded-xl object-cover md:h-56 md:w-80 lg:h-64 lg:w-96"
              style={{animationDelay: `${80 + index * 70}ms`}}
            />
          ))}
        </div>
      </section>

      {/* Proof Points + Conversion CTA */}
      <section className="bg-gradient-to-b from-[#0a0a0a] to-black px-6 py-20 md:px-10 lg:px-12">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Heading
              as="h2"
              className="vm-reveal mx-auto font-display text-xl font-black uppercase tracking-[0.1em] text-moonwax md:text-3xl"
            >
              Why Videomancer?
            </Heading>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {proofCards.map((card, index) => (
                <article
                  key={card.title}
                  className="vm-reveal rounded-2xl border border-white/10 bg-[#111] p-5"
                  style={{animationDelay: `${120 + index * 90}ms`}}
                >
                  <img src={card.icon} alt="" width={56} height={56} className="mb-3 h-14 w-14" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-moonwax">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="vm-reveal vm-reveal-delay-3 flex flex-col justify-center rounded-2xl border border-mystic/30 bg-[#12101c] p-7">
            <h3 className="font-display text-xl font-bold uppercase tracking-[0.1em] text-moonwax md:text-3xl">
              We've been expecting you
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Pick up the instrument. We built the docs, the programs, and the
              community so your first session delivers.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/products/videomancer"
                className="rounded-full bg-mystic px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-moonwax shadow-lg shadow-mystic/20 transition-all duration-200 any-hover:hover:bg-mystic-light any-hover:hover:shadow-mystic/35"
              >
                Buy Videomancer
              </Link>
              <Link
                to="/docs/instruments/videomancer"
                className="rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all duration-200 any-hover:hover:border-white/50 any-hover:hover:bg-white/10"
              >
                Study the workflow
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

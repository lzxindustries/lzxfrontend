import {BeforeAfterSlider} from '~/components/BeforeAfterSlider';
import {Link} from '~/components/Link';
import {Heading, Text} from '~/components/Text';
import landing from '../../content/landing/videomancer.json';

const {sections, segments, proofCards, sourcePairs, hardwareImages, btsImages} =
  landing;

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
              {sections.beforeAfter.heading}
            </Heading>
            <Text
              as="p"
              className="vm-reveal vm-reveal-delay-1 mx-auto mt-3 max-w-xl text-white/60 md:text-lg"
            >
              {sections.beforeAfter.subheading}
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
              {sections.identitySelector.heading}
            </Heading>
            <Text
              as="p"
              className="vm-reveal vm-reveal-delay-1 mx-auto mt-3 max-w-2xl text-white/60 md:text-lg"
            >
              {sections.identitySelector.subheading}
            </Text>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {segments.map((segment, index) => (
              <Link
                key={segment.id}
                to={`/instruments/videomancer#${segment.id}`}
                className="vm-reveal group rounded-2xl border border-lzx-border/40 bg-lzx-card/50 p-6 transition-all duration-300 any-hover:hover:scale-[1.03] any-hover:hover:border-mystic/60 any-hover:hover:bg-lzx-card/80"
                style={{animationDelay: `${120 + index * 80}ms`}}
              >
                <div className="mb-4" aria-hidden="true">
                  <img
                    src={segment.icon}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14"
                  />
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
            {sections.hardware.heading}
          </Heading>
          <Text
            as="p"
            className="vm-reveal vm-reveal-delay-1 mx-auto mt-3 max-w-xl text-center text-white/60 md:text-lg"
          >
            {sections.hardware.subheading}
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
            {sections.bts.heading}
          </Heading>
          <Text
            as="p"
            className="vm-reveal vm-reveal-delay-1 mx-auto mt-3 max-w-xl text-center text-white/60 md:text-lg"
          >
            {sections.bts.subheading}
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
              {sections.proof.heading}
            </Heading>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {proofCards.map((card, index) => (
                <article
                  key={card.title}
                  className="vm-reveal rounded-2xl border border-white/10 bg-[#111] p-5"
                  style={{animationDelay: `${120 + index * 90}ms`}}
                >
                  <img
                    src={card.icon}
                    alt=""
                    width={56}
                    height={56}
                    className="mb-3 h-14 w-14"
                  />
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
              {sections.proof.ctaHeading}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              {sections.proof.ctaBody}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/instruments/videomancer"
                className="inline-flex items-center justify-center min-h-11 rounded-full bg-mystic px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-moonwax shadow-lg shadow-mystic/20 transition-all duration-200 any-hover:hover:bg-mystic-light any-hover:hover:shadow-mystic/35"
              >
                {sections.proof.buyLabel}
              </Link>
              <Link
                to="/instruments/videomancer/manual/user-manual"
                className="inline-flex items-center justify-center min-h-11 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all duration-200 any-hover:hover:border-white/50 any-hover:hover:bg-white/10"
              >
                {sections.proof.studyLabel}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

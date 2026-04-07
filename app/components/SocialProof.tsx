import {Link} from '~/components/Link';

interface UseCase {
  title: string;
  body: string;
  icon: string;
}

interface Testimonial {
  quote: string;
  author: string;
  context: string;
}

const useCases: UseCase[] = [
  {
    title: 'Live Performance',
    icon: '◈',
    body: 'Connect a camera or media player, load a program, and shape the image in real time with hardware knobs. The tactile workflow is built for the stage.',
  },
  {
    title: 'Glitch & Texture',
    icon: '◇',
    body: 'Create visual artifacts, analog distortions, and circuit-bent aesthetics. Each program has unique analog character, not a filter preset.',
  },
  {
    title: 'Format Conversion',
    icon: '⇌',
    body: 'Accept composite, component, and HDMI sources in the same session. Translate between analog and digital ecosystems without external converters.',
  },
  {
    title: 'Audio-Reactive',
    icon: '∿',
    body: 'Map movement, rhythm, and control voltage into image behavior. MIDI controllers and audio input drive video parameters directly.',
  },
];

const testimonials: Testimonial[] = [
  {
    quote: 'It was a genius level idea! Loving my Videomancer, its better than I dreamed! This product is going to have a long and happy life.',
    author: 'Boneoh',
    context: 'Discord',
  },
  {
    quote: "I'm not at all surprised that you got such strong demand, this is a great product. And as a development platform rather than a static hardware device, Videomancer has 'legs'.",
    author: 'Aaron F. Ross',
    context: 'Discord',
  },
  {
    quote: 'Fully invested in this thing you\'ve built here, Lars. Thanks for making it possible to make something genuinely cool in an analog fashion.',
    author: 'Jojo from Wireland',
    context: 'Discord',
  },
  {
    quote: 'Videomancer was awesome at the techno party on Saturday.',
    author: 'Dr. Rek',
    context: 'Discord',
  },
  {
    quote: 'Thanks for making a device that doesn\'t introduce unnecessary latency! I\'ve never seen any digital processor that doesn\'t introduce frame delays. Except Videomancer!',
    author: 'Aaron F. Ross',
    context: 'Discord',
  },
  {
    quote: 'Videomancer is a HD analog beast. The most important function I get is the analog/digital conversion between all possible formats, and both of the effects are amazing.',
    author: 'hadesbox',
    context: 'Discord',
  },
  {
    quote: 'Videomancer has been a great travel pal.',
    author: 'Dewb',
    context: 'Discord',
  },
  {
    quote: 'Easy setup to get from unpacking to mancing.',
    author: 'Respirator',
    context: 'Discord',
  },
];

export function SocialProof() {
  return (
    <section className="overflow-hidden bg-[#0a0a0a] px-6 py-20 md:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="vm-reveal font-display text-center text-xl font-black uppercase tracking-[0.1em] text-moonwax md:text-3xl">
          How artists use Videomancer
        </h2>

        <div className="vm-reveal vm-reveal-delay-1 -mx-6 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:-mx-10 md:px-10 lg:-mx-12 lg:px-12"
          style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent'}}
        >
          {useCases.map((uc, index) => (
            <article
              key={index}
              className="w-[300px] flex-none snap-center rounded-xl border border-lzx-border/40 bg-lzx-card/80 p-6 md:w-[340px]"
            >
              <span className="mb-3 block text-4xl text-moonwax" aria-hidden="true">
                {uc.icon}
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-moonwax">
                {uc.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                {uc.body}
              </p>
            </article>
          ))}
        </div>

        <div className="vm-reveal vm-reveal-delay-2 mt-8 text-center">
          <Link
            to="/products/videomancer"
            className="inline-block rounded-full bg-mystic px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-moonwax shadow-lg shadow-mystic/20 transition-all duration-200 any-hover:hover:bg-mystic-light any-hover:hover:shadow-mystic/35"
          >
            Explore Videomancer
          </Link>
        </div>

        {/* Community Testimonials */}
        <div className="mt-16">
          <h3 className="vm-reveal text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            What the community is saying
          </h3>
          <div className="hiddenScroll -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:-mx-10 md:px-10 lg:-mx-12 lg:px-12">
            {testimonials.map((t, index) => (
              <blockquote
                key={index}
                className="vm-reveal w-[320px] flex-none snap-center rounded-xl border border-white/8 bg-white/[0.03] p-6"
                style={{animationDelay: `${100 + index * 60}ms`}}
              >
                <p className="text-sm leading-relaxed text-white/75 before:content-['\201C'] after:content-['\201D']">
                  {t.quote}
                </p>
                <footer className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-moonwax">{t.author}</span>
                  <span className="text-[10px] text-white/30">{t.context}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

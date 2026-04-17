import {Link} from '~/components/Link';
import {Heading, Text} from '~/components/Text';

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] lg:h-[100svh] overflow-hidden bg-black">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/media/hero_poster.jpg"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      >
        <source src="/media/hero_loop.webm" type="video/webm" />
        <source src="/media/hero_loop.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(80,76,159,0.5)_0%,_transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] lg:h-full w-full max-w-7xl items-center gap-8 px-6 py-16 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-12">
        <div className="flex flex-col justify-center">
          <p className="vm-reveal mb-5 inline-flex w-fit items-center rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-mystic-light backdrop-blur-sm">
            Video Effects Console
          </p>

          <Heading
            as="h1"
            className="vm-reveal vm-reveal-delay-1 font-display max-w-[14ch] text-3xl font-black uppercase leading-[1.02] tracking-[0.06em] text-moonwax sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Something remarkable is about to happen to your video signal
          </Heading>

          <Text
            as="p"
            className="vm-reveal vm-reveal-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
          >
            Videomancer is a hardware video effects console for live
            performance, glitch art, format conversion, and audio-reactive
            workflows.
          </Text>

          <div className="vm-reveal vm-reveal-delay-3 mt-8 hidden flex-wrap items-center gap-3 sm:mt-10 lg:flex">
            <Link
              to="/instruments/videomancer"
              className="rounded-full bg-mystic px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-moonwax shadow-lg shadow-mystic/25 transition-all duration-200 any-hover:hover:bg-mystic-light any-hover:hover:shadow-mystic/40 sm:px-9 sm:py-4 sm:text-base"
            >
              Shop now
            </Link>
            <Link
              to="/instruments/videomancer/manual/user-manual"
              className="rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-all duration-200 any-hover:hover:border-white/60 any-hover:hover:bg-white/10 sm:py-4"
            >
              See docs
            </Link>
          </div>

          <p className="vm-reveal vm-reveal-delay-3 mt-4 hidden text-xs uppercase tracking-[0.18em] text-white/50 lg:block">
            Ships in 24 hours
          </p>
        </div>

        {/* Floating product image */}
        <div className="flex items-center justify-center">
          <img
            src="/images/videomancer/hero-product.png"
            alt="Videomancer — FPGA video synthesis instrument"
            className="vm-reveal vm-reveal-delay-4 w-full max-w-[280px] drop-shadow-[0_0_60px_rgba(80,76,159,0.4)] sm:max-w-[340px] lg:max-w-[480px]"
            loading="eager"
          />
        </div>

        {/* Buttons below product image on mobile */}
        <div className="flex flex-col items-center lg:hidden">
          <div className="vm-reveal vm-reveal-delay-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/instruments/videomancer"
              className="rounded-full bg-mystic px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-moonwax shadow-lg shadow-mystic/25 transition-all duration-200 any-hover:hover:bg-mystic-light any-hover:hover:shadow-mystic/40 sm:px-9 sm:py-4 sm:text-base"
            >
              Shop now
            </Link>
            <Link
              to="/instruments/videomancer/manual/user-manual"
              className="rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-all duration-200 any-hover:hover:border-white/60 any-hover:hover:bg-white/10 sm:py-4"
            >
              See docs
            </Link>
          </div>
          <p className="vm-reveal vm-reveal-delay-3 mt-4 text-xs uppercase tracking-[0.18em] text-white/50">
            Ships in 24 hours
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 motion-reduce:hidden">
        <svg
          className="h-6 w-6 animate-bounce text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7"
          />
        </svg>
      </div>
    </section>
  );
}

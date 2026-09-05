import Link from 'next/link';
import Image from 'next/image';
import { Wordmark } from '../layout/Wordmark';

export function Hero() {
  return (
    <section className="m-0 relative w-full min-h-[88vh] md:min-h-[640px] flex justify-center pt-[136px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-ink">
        <Image
          src="/images/hero-ethnic.jpg"
          alt="Luxury Indian ethnic fashion — embroidered silk kurta set in heritage architecture"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-80"
        />
      </div>

      {/* Flat dark overlay */}
      <div className="absolute inset-0 z-10" style={{ backgroundColor: 'rgba(30,22,18,0.32)' }} />

      {/* Top gradient overlay specifically for header visibility */}
      <div
        className="absolute inset-0 z-[15] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(30,22,18,0.6) 0%, rgba(30,22,18,0) 20%)',
        }}
      />

      {/* Bottom gradient overlay to ivory */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 78%, var(--color-ivory) 100%)',
        }}
      />

      {/* Content Block */}
      <div className="relative z-30 flex flex-col items-center w-full px-6">
        <div className="flex flex-col items-start gap-[48px] w-full max-w-[var(--max-content)] mx-auto">
          <Wordmark id="hero-wordmark" />
          {/* Tagline — separate from wordmark so it doesn't get FLIP-scaled */}
          <p
            className="fixed z-[55] pointer-events-none whitespace-nowrap italic select-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(0.85rem, 2vw, 1.4rem)',
              lineHeight: 1,
              left: 'max(24px, calc((100vw - var(--max-content)) / 2 + 24px))',
              top: 'calc(120px + clamp(2.5rem, 11vw, 9rem) + 12px)',
              color: 'var(--color-ivory)',
              opacity: 0.7,
              letterSpacing: '0.06em',
            }}
            aria-hidden="true"
            id="hero-tagline"
          >
            Indian craft, reimagined.
          </p>
          <div
            className="flex flex-col gap-2"
            style={{ marginTop: 'calc(clamp(2.5rem, 11vw, 9rem) + 60px)' }}
          >
            <h1 className="font-hero-1 text-white">An Edit of</h1>
            <h1 className="font-hero-1 text-white italic">Modern Romance</h1>
          </div>
        </div>

        <Link
          href="/shop"
          className="font-btn text-white border border-white hover:bg-white hover:text-ink transition-colors duration-200 self-center"
          style={{ marginTop: 'auto', marginBottom: '80px', padding: '15px 36px' }}
        >
          SHOP THE EDIT
        </Link>
      </div>
    </section>
  );
}

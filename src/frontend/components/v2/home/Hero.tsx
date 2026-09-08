import Link from 'next/link';
import Image from 'next/image';
import { Wordmark } from '../layout/Wordmark';

export function Hero() {
  return (
    <section className="m-0 relative w-full min-h-[88vh] md:min-h-[640px] flex flex-col pt-[136px]">
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
      <div className="relative z-30 flex flex-col flex-1 w-full max-w-[var(--max-content)] mx-auto px-6">
        {/* Wordmark + tagline — both animated together by Header.tsx scroll animation via id="hero-wordmark" */}
        <Wordmark id="hero-wordmark" />

        {/* Shop CTA — centered, more prominent */}
        <div className="mt-auto mb-[80px] w-full flex justify-center">
          <Link
            href="/shop"
            className="font-btn text-[var(--color-ink)] bg-[var(--color-ivory)] border border-[var(--color-ivory)] hover:bg-transparent hover:text-white transition-all duration-300 tracking-[0.18em] text-[12px]"
            style={{ padding: '18px 56px', letterSpacing: '0.18em' }}
          >
            SHOP THE EDIT
          </Link>
        </div>
      </div>
    </section>
  );
}

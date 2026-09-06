import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/frontend/components/layout/Container';

export function Heritage() {
  return (
    <section className="bg-[var(--color-ivory)] py-[96px] md:py-[160px]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-[28px] items-center">
          {/* Left - Image (Cols 1-5) */}
          <div className="md:col-span-5 relative w-full" style={{ aspectRatio: '3/4' }}>
            <Image
              src="https://images.unsplash.com/photo-1616583936499-d4116e7e2e76?auto=format&fit=crop&w=800&q=80"
              alt="Born from Bombay"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          {/* Right - Text (Cols 7-11) */}
          <div className="md:col-start-7 md:col-span-5 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-terracotta)] font-medium block mb-3 font-body">
              Atelier & Craft
            </span>
            <h2 className="font-hero-1 text-[var(--color-deep-brown)]">Born from Bombay</h2>

            <p className="font-body-text mt-[24px] text-[var(--color-muted)]">
              The Bombay Edit was born out of a desire to bring the unmatched heritage of Indian
              craftsmanship to the modern woman. Every piece is a celebration of intricate
              techniques, woven into silhouettes that move with grace and intent.
            </p>

            <div className="mt-[32px]">
              <Link
                href="/our-story"
                className="font-btn text-[var(--color-deep-brown)] border-b border-[var(--color-terracotta)] hover:text-[var(--color-wine)] hover:border-[var(--color-wine)] transition-colors"
                style={{ textUnderlineOffset: '6px' }}
              >
                READ OUR STORY
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';

export function IntroSplit() {
  return (
    <section className="bg-[var(--color-ivory)] py-[72px] lg:py-[120px]">
      <Container>
        <div className="flex flex-col md:grid md:grid-cols-1 md:gap-[40px] lg:grid-cols-12 lg:gap-[28px] lg:items-start">
          {/* Mobile/Tablet: Image First | Desktop: Right Image (col-start-7) */}
          <div className="order-1 lg:order-2 lg:col-start-7 lg:col-span-6 w-full mb-[40px] lg:mb-0">
            <div className="bg-[var(--color-ivory)] border border-[var(--color-line)] p-[10px] w-full">
              <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                <Image
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&h=900&q=80"
                  alt="Curated in Bombay"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Mobile/Tablet: Text Below | Desktop: Left Text (col-span-4) */}
          <div className="order-2 lg:order-1 lg:col-span-4 w-full">
            <h2
              className="text-[var(--color-ink)] max-w-[300px]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: '32px',
                lineHeight: 1.3,
              }}
            >
              <span className="lg:text-[27px] xl:text-[32px]">
                Curated with love in Bombay. Chosen for you in Nepal.
              </span>
            </h2>

            <div style={{ height: '26px' }} />

            <p className="font-body text-[var(--color-muted)] max-w-[320px]">
              We believe in the slow, meticulous art of Indian craftsmanship. Every piece in our
              collection is hand-selected from the finest ateliers in Bombay, bringing a touch of
              old-world romance and modern luxury to the heart of Nepal.
            </p>

            <div style={{ height: '28px' }} />

            <Link
              href="/our-story"
              className="inline-block font-body text-[11px] tracking-[0.1em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:opacity-70 transition-opacity"
              style={{ textUnderlineOffset: '6px' }}
            >
              DISCOVER OUR STORY →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

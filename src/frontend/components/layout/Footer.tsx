import Link from 'next/link';
import { Container } from '@/frontend/components/layout/Container';

export function Footer() {
  return (
    <footer className="bg-[var(--color-shell)] border-t border-[var(--color-line)] pt-[80px] pb-[32px]" style={{ marginTop: '160px' }}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-[24px]">
          {/* Brand (Cols 1-4) */}
          <div className="md:col-span-4 flex flex-col">
            <Link
              href="/"
              className="w-[40px] h-[40px] bg-transparent border border-[var(--color-line)] flex items-center justify-center text-[15px] hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              BE
            </Link>
            <p className="font-body-text mt-[24px] max-w-[280px]">
              Elevating Indian craftsmanship for the global wardrobe.
            </p>
          </div>

          {/* Explore (Cols 5-6) */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="font-eyebrow text-[var(--color-ink)] mb-[24px]">EXPLORE</h4>
            <div className="flex flex-col gap-[16px]">
              <Link href="/shop" className="font-caption hover:opacity-70 transition-opacity">Shop</Link>
              <Link href="/collections/festive" className="font-caption hover:opacity-70 transition-opacity">The Festive Edit</Link>
              <Link href="/our-story" className="font-caption hover:opacity-70 transition-opacity">Our Story</Link>
            </div>
          </div>

          {/* Support (Cols 7-8) */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="font-eyebrow text-[var(--color-ink)] mb-[24px]">SUPPORT</h4>
            <div className="flex flex-col gap-[16px]">
              <Link href="/contact" className="font-caption hover:opacity-70 transition-opacity">Contact</Link>
              <Link href="/policies/shipping" className="font-caption hover:opacity-70 transition-opacity">Shipping</Link>
              <Link href="/policies/refund-policy" className="font-caption hover:opacity-70 transition-opacity">Returns</Link>
            </div>
          </div>

          {/* Subscribe (Cols 9-12) */}
          <div className="md:col-span-4 flex flex-col">
            <h4 className="font-eyebrow text-[var(--color-ink)] mb-[24px]">JOIN THE LIST</h4>
            <div className="flex flex-col">
              <input
                type="email"
                placeholder="Email Address"
                className="font-caption bg-transparent border-b border-[var(--color-line)] pb-[8px] focus:outline-none focus:border-[var(--color-ink)] transition-colors placeholder:text-[var(--color-muted)] text-[var(--color-ink)] w-full"
              />
              <p className="font-caption mt-[16px]">
                Subscribe to receive updates, access to exclusive deals, and more.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-[80px] flex flex-col md:flex-row justify-between items-center border-t border-[var(--color-line)] pt-[24px]">
          <p className="font-caption mb-4 md:mb-0">© 2024 The Bombay Edit.</p>
          <div className="flex gap-[24px]">
            <Link href="/policies/terms-of-service" className="font-caption hover:opacity-70 transition-opacity">Terms</Link>
            <Link href="/policies/privacy-policy" className="font-caption hover:opacity-70 transition-opacity">Privacy</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
